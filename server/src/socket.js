import { Server } from "socket.io";
import http from "http";
import { app } from "./app.js";
import User from "./models/user.model.js";
import FriendRequest from "./models/friendRequest.js";
import path from "path";
import OneToOneMessage from "./models/OneToOneMessage.js";
import { v2 as cloudinary, v2 } from "cloudinary";
import { uploadCloudinary } from "./utils/cloudinary.js";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://chat-app-fawn-six.vercel.app"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  // console.log(JSON.stringify(socket.handshake.query));
  const user_id = socket.handshake.query["auth_id"];
  const socket_id = socket.id;
  console.log(`User connected ${socket.id}`);

  if (user_id !== null && Boolean(user_id)) {
    try {
      const user = await User.findByIdAndUpdate(
        user_id, // user id
        {
          socket_id, // update
          status: "Online",
        },
        { new: true } // return updated doc
      );
      console.log(`enter_${user?.userName}_${user?.status}_${user.friends}`);
      const socket_ids = user?.friends?.map(async (id) => {
        const { socket_id } = await User.findById(id).select("socket_id -_id");
        return socket_id;
      });
      const EmmitStatusTo = await Promise.all(socket_ids);
      console.log(EmmitStatusTo);

      EmmitStatusTo.forEach((socketId) => {
        if (socketId) {
          const socketExists = io.sockets.sockets.get(socketId);
          if (socketExists) {
            io.to(socketId).emit("user_status_update", {
              id: user._id,
              status: user?.status,
            });
          }
          // else {
          //   console.error(`Socket ID not connected: ${socketId}`);
          // }
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  // socket event listeners

  socket.on("friend_request", async (data) => {
    // sender
    const from = await User.findById(data.from).select("socket_id");
    // recipient
    const to = await User.findById(data.to).select("socket_id");

    await FriendRequest.create({
      sender: data.from,
      recipient: data.to,
    });

    io.to(to?.socket_id).emit("new_friend_request", {
      message: "New friend request received",
    });
    io.to(from?.socket_id).emit("request_sent", {
      message: "Request Sent successfully",
    });
  });

  socket.on("accept_request", async (data) => {
    const request_doc = await FriendRequest.findById(data.request_id);
    const sender = await User.findById(request_doc.sender);
    const receiver = await User.findById(request_doc.recipient);

    sender.friends.push(request_doc.recipient);
    receiver.friends.push(request_doc.sender);

    await receiver.save({ new: true, validateModifiedOnly: true });
    await sender.save({ new: true, validateModifiedOnly: true });

    // delete this request doc
    await FriendRequest.findByIdAndDelete(data.request_id);

    // emit event to both of them
    io.to(sender?.socket_id).emit("request_accepted", {
      message: `${receiver.userName} Accepted your Friend Request`,
    });
    io.to(receiver?.socket_id).emit("request_accepted", {
      message: `You Accepted ${sender.userName} Friend Request`,
    });
  });

  // socket.on("get_direct_conversations", async ({ user_id }, callback) => {
  //   const existing_conversations = await OneToOneMessage.find({
  //     participants: { $all: [user_id] },
  //   }).populate("participants");
  //   // .select("userName avatar _id email status");

  //   callback(existing_conversations);
  // });

  socket.on("start_conversation", async (data) => {
    if (data.chat_type == "individual") {
      const { to, from, chat_type } = data;
      // check if there is any existing conversation
      const existing_conversations = await OneToOneMessage.find({
        type: "individual",
        participants: { $size: 2, $all: [to, from] },
      })
        .populate("participants")
        .select("userName avatar _id email status");
      // console.log(existing_conversations[0], "Existing Conversation");
      // if no => create a new OneToOneMessage doc & emit event "start_chat" & send conversation details as payload
      if (existing_conversations.length === 0) {
        let new_chat = await OneToOneMessage.create({
          participants: [to, from],
          type: chat_type,
        });
        // console.log(new_chat, "new_chat");
        new_chat = await OneToOneMessage.findById(new_chat._id)
          .populate("participants")
          .select("userName avatar _id email status");
        socket.emit("start_chat", new_chat);
      }
      // if yes => just emit event "start_chat" & send conversation details as payload
      else {
        socket.emit("start_chat", existing_conversations[0]);
      }
    }
  });

  socket.on("group_created", async (data) => {
    const { participants, admin } = data;
    const { socket_id } = await User.findById(admin).select("socket_id -_id");
    const socket_ids = participants.map((el) => el?.socket_id);

    console.log(
      "Admin Socket Id",
      socket_id,
      "Participants' socket IDs:",
      socket_ids
    );

    // Check for any invalid socket IDs
    const invalidSocketIds = socket_ids.filter((socketId) => !socketId);
    if (invalidSocketIds.length > 0) {
      console.error("Invalid socket IDs found:", invalidSocketIds);
    }
    io.to(socket_id).emit("new_groupChat_admin", data);
    socket_ids.forEach((socketId) => {
      if (socketId) {
        const socketExists = io.sockets.sockets.get(socketId);
        if (socketExists) {
          console.log(`Emitting to socket ID: ${socketId}`);
          io.to(socketId).emit("new_groupChat", data);
        } else {
          console.error(`Socket ID not connected: ${socketId}`);
        }
      } else {
        console.error("Encountered a null or undefined socket ID.");
      }
    });
  });

  socket.on("get_messages", async (data, callback) => {
    const messages = await OneToOneMessage.findById(
      data.conversation_id
    ).select("messages");
    callback(messages);
  });

  // Handle text/link messages
  socket.on("text_message", async (data) => {
    const { message, conversation_id, from, to, type, chat_type } = data;

    switch (chat_type) {
      case "individual":
        const to_user = await User.findById(...to);
        const from_user_individual = await User.findById(from);
        const Direct_message = {
          to: to,
          from: from,
          type: type,
          created_at: Date.now(),
          text: message,
        };
        // fetch OneToOneMessage Doc & push a new message to existing conversation
        const Direct_Chat = await OneToOneMessage.findById(conversation_id);
        Direct_Chat.messages.push(Direct_message);
        // save to db`
        await Direct_Chat.save({ new: true, validateModifiedOnly: true });

        // emit incoming_message -> to user
        io.to(to_user?.socket_id).emit("new_message", {
          conversation_id,
          message: Direct_Chat.messages.slice(-1)[0],
          chat_type,
        });

        // emit outgoing_message -> from user
        io.to(from_user_individual?.socket_id).emit("new_message", {
          conversation_id,
          message: Direct_Chat.messages.slice(-1)[0],
          chat_type,
        });
        break;
      case "group":
        const { admin } = await OneToOneMessage.findById(conversation_id);
        const from_user_group = await User.findById(from);

        const sendTo = [...to, admin.toString()].filter((id) => id !== from);

        console.log(sendTo, from);

        const Group_message = {
          to: sendTo,
          from: from,
          type: type,
          created_at: Date.now(),
          text: message,
        };

        const Group_Chat = await OneToOneMessage.findById(conversation_id);
        Group_Chat.messages.push(Group_message);
        // save to db`
        await Group_Chat.save({ new: true, validateModifiedOnly: true });

        io.to(from_user_group?.socket_id).emit("new_message", {
          conversation_id,
          message: Group_Chat.messages.slice(-1)[0],
          chat_type,
        });

        const socket_ids = sendTo.map(async (id) => {
          const { socket_id } =
            await User.findById(id).select("socket_id -_id");
          return socket_id;
        });

        Promise.all(socket_ids)
          .then((Sockets) => {
            Sockets.forEach((socketId) => {
              if (socketId) {
                const socketExists = io.sockets.sockets.get(socketId);
                if (socketExists) {
                  io.to(socketId).emit("new_message", {
                    conversation_id,
                    message: Group_Chat.messages.slice(-1)[0],
                    chat_type,
                  });
                } else {
                  console.error(`Socket ID not connected: ${socketId}`);
                }
              } else {
                console.error("Encountered a null or undefined socket ID.");
              }
            });
          })
          .catch(() => console.log("error will finding scoket ids"));

        break;
      default:
        break;
    }
  });

  socket.on("update_unreadMsgs", async (data) => {
    console.log(data);
    const { conversation_id, message, chat_type } = data;
    const chat = await OneToOneMessage.findById(conversation_id);
    chat.unreadmessages.push(message);
    await chat.save({ new: true, validateModifiedOnly: true });
    switch (chat_type) {
      case "individual":
        const to_user = await User.findById(message.to[0]);

        io.to(to_user?.socket_id).emit("on_update_unreadMsg", {
          conversation_id,
          unread: chat.unreadmessages,
          chat_type,
        });

        break;
      case "group":
        console.log(data);
        const socket_ids = message.to.map(async (id) => {
          const { socket_id } =
            await User.findById(id).select("socket_id -_id");
          return socket_id;
        });
        Promise.all(socket_ids)
          .then((Sockets) => {
            Sockets.forEach((socketId) => {
              if (socketId) {
                io.to(socketId).emit("on_update_unreadMsg", {
                  conversation_id,
                  unread: chat.unreadmessages,
                  chat_type,
                });
              } else {
                console.error("Encountered a null or undefined socket ID.");
              }
            });
          })
          .catch(() => console.log("error will finding scoket ids"));
        break;
      default:
        break;
    }
  });

  // Handle show Typing status
  socket.on("Typing", async (data) => {
    const { room_id, currentUser, type, current_conversation } = data;
    const { admin } = await OneToOneMessage.findById(room_id);
    switch (type) {
      case "individual":
        const { socket_id } =
          await User.findById(current_conversation).select("socket_id -_id");
        io.to(socket_id).emit("Is_Typing", {
          userName: currentUser.userName,
          room_id,
        });
        console.log("emiiter");
        break;
      case "group":
        const TypingStatSendto = [
          ...current_conversation,
          admin.toString(),
        ].filter((id) => id !== currentUser.auth_id.toString());
        const socket_ids = TypingStatSendto.map(async (id) => {
          const { socket_id } =
            await User.findById(id).select("socket_id -_id");
          return socket_id;
        });
        Promise.all(socket_ids)
          .then((Sockets) => {
            Sockets.forEach((socketId) => {
              if (socketId) {
                const socketExists = io.sockets.sockets.get(socketId);
                if (socketExists) {
                  io.to(socketId).emit("Is_Typing", {
                    userName: currentUser.userName,
                    room_id,
                  });
                } else {
                  console.error(`Socket ID not connected: ${socketId}`);
                }
              } else {
                console.error("Encountered a null or undefined socket ID.");
              }
            });
          })
          .catch(() => console.log("error will finding scoket ids"));

        break;
      default:
        console.log("type is not mentioned unable to emit typing event");
        break;
    }
  });

  socket.on("Stop_Typing", async (data) => {
    const { room_id, currentUser, type, current_conversation } = data;
    const { admin } = await OneToOneMessage.findById(room_id);
    switch (type) {
      case "individual":
        const { socket_id } =
          await User.findById(current_conversation).select("socket_id -_id");
        io.to(socket_id).emit("Is_Stop_Typing", {
          userName: currentUser.userName,
          room_id,
        });
        break;
      case "group":
        const TypingStatSendto = [
          ...current_conversation,
          admin.toString(),
        ].filter((id) => id !== currentUser.auth_id.toString());
        const socket_ids = TypingStatSendto.map(async (id) => {
          const { socket_id } =
            await User.findById(id).select("socket_id -_id");
          return socket_id;
        });
        Promise.all(socket_ids)
          .then((Sockets) => {
            Sockets.forEach((socketId) => {
              if (socketId) {
                const socketExists = io.sockets.sockets.get(socketId);
                if (socketExists) {
                  io.to(socketId).emit("Is_Stop_Typing", {
                    userName: currentUser.userName,
                    room_id,
                  });
                } else {
                  console.error(`Socket ID not connected: ${socketId}`);
                }
              } else {
                console.error("Encountered a null or undefined socket ID.");
              }
            });
          })
          .catch(() => console.log("error will finding scoket ids"));
        break;
      default:
        console.log("type is not mentioned unable to emit typing event");
        break;
    }
  });

  // clear unread messages
  socket.on("clear_unread", async (data) => {
    const { conversation_id } = data;
    const updated = await OneToOneMessage.updateOne(
      { _id: conversation_id },
      { $set: { unreadmessages: [] } }
    );
    console.log(updated, "cleared unread");
  });
  // Handle media/Doc messages
  socket.on("media_message", async (data) => {
    // data : {to ,from , text ,file}
    const { conversation_id, message, from, to, type, chat_type } = data;
    const { file, text } = message;
    // get the fiel extension

    // const fileExtension = path.extname(data.file.name);

    // const fileName = `${Date.now()}_${Math.floor(Math.random() * 10000)}${fileExtension}`;

    // upload file to cloudinary
    const img = await v2.uploader.upload(file[0].blob);

    // create a new conversation only if it doesn't exists yet or add new message to the list

    switch (chat_type) {
      case "individual":
        const to_user = await User.findById(...to);
        const from_user_individual = await User.findById(from);
        const Direct_message = {
          to: to,
          from: from,
          type: type,
          created_at: Date.now(),
          text,
          file: img?.url,
        };
        // fetch OneToOneMessage Doc & push a new message to existing conversation
        const Direct_Chat = await OneToOneMessage.findById(conversation_id);
        Direct_Chat.messages.push(Direct_message);
        // save to db`
        await Direct_Chat.save({ new: true, validateModifiedOnly: true });

        // emit incoming_message -> to user
        io.to(to_user?.socket_id).emit("new_message", {
          conversation_id,
          message: Direct_Chat.messages.slice(-1)[0],
          chat_type,
        });

        // emit outgoing_message -> from user
        io.to(from_user_individual?.socket_id).emit("new_message", {
          conversation_id,
          message: Direct_Chat.messages.slice(-1)[0],
          chat_type,
        });
        break;
      case "group":
        const { admin } = await OneToOneMessage.findById(conversation_id);
        const from_user_group = await User.findById(from);

        const sendTo = [...to, admin.toString()].filter((id) => id !== from);

        const Group_message = {
          to: sendTo,
          from: from,
          type: type,
          created_at: Date.now(),
          text: text,
          file: img?.url,
        };
        const Group_Chat = await OneToOneMessage.findById(conversation_id);
        Group_Chat.messages.push(Group_message);
        // save to db`
        await Group_Chat.save({ new: true, validateModifiedOnly: true });
        io.to(from_user_group?.socket_id).emit("new_message", {
          conversation_id,
          message: Group_Chat.messages.slice(-1)[0],
          chat_type,
        });

        const socket_ids = sendTo.map(async (id) => {
          const { socket_id } =
            await User.findById(id).select("socket_id -_id");
          return socket_id;
        });

        Promise.all(socket_ids)
          .then((Sockets) => {
            Sockets.forEach((socketId) => {
              io.to(socketId).emit("new_message", {
                conversation_id,
                message: Group_Chat.messages.slice(-1)[0],
                chat_type,
              });
            });
          })
          .catch(() => console.log("error will finding scoket ids"));

        break;
      default:
        break;
    }
    // save to the db

    // emit the incoming message --> to receiver
    // emit the outgoing message --> to sender
  });

  socket.on("exit", async (data) => {
    const { user_id, friends } = data;
    if (user_id) {
      const user = await User.findByIdAndUpdate(
        user_id, // user id
        {
          socket_id, // update
          status: "Offline",
        },
        { new: true } // return updated doc
      );

      console.log(`exist${user.userName}_${user.status}_${user.friends}`);

      const socket_ids = friends?.map(async (id) => {
        const { socket_id } = await User.findById(id).select("socket_id -_id");
        return socket_id;
      });
      const EmmitStatusTo = await Promise.all(socket_ids);
      console.log(EmmitStatusTo);
      EmmitStatusTo.forEach((socketId) => {
        if (socketId) {
          const socketExists = io.sockets.sockets.get(socketId);
          if (socketExists) {
            console.log("exist", {
              id: user._id,
              status: user?.status,
            });

            io.to(socketId).emit("user_status_update", {
              id: user._id,
              status: user?.status,
            });
          } else {
            console.error(`Socket ID not connected: ${socketId}`);
          }
        } else {
          console.error("Encountered a null or undefined socket ID.");
        }
      });
    }

    // Todo broadcast user disconnection;

    console.log("closing connection");
    socket.disconnect(0);
  });

  // socket.on("disconnect", (socket) => {
  //   console.log("user disconnected",socket.id);
  // });
});

export { server };
