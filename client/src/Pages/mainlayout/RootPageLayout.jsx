import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./RootPageLayout.css";

import { IoSettingsOutline, IoSettingsSharp } from "react-icons/io5";
import { useSelector, useDispatch } from "react-redux";
import { getAuthState } from "../../store/slices/authSlice.js";
import { connectSocket, socket } from "../../socket.js";
import ToastConfig from "../../toastConfig/ToastConfig.jsx";
import { CiLogout } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import toast from "react-hot-toast";
import {
  useFriendsQuery,
  useGetConversationMutation,
  useLogoutMutation,
} from "../../store/slices/apiSlice.js";
import { updateFriends } from "../../store/slices/appSlice.js";
import {
  addDirectConversation,
  addDirectMessage,
  addGroupConversation,
  addGroupMessage,
  setCurrentDirectConversation,
  updateDirectConversation,
  updateGroupConversation,
} from "../../store/slices/conversation.js";
import { RiGroupFill, RiGroupLine } from "react-icons/ri";
import {
  MdOutlineChatBubble,
  MdOutlineChatBubbleOutline,
} from "react-icons/md";

const RootPageLayout = () => {
  const dispatch = useDispatch();
  const Navigate = useNavigate();
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [openuserDialog, setOpenuserDialog] = useState(false);
  const user = useSelector(getAuthState);
  //current Logged In user
  const { _id: auth_id } = JSON.parse(localStorage.getItem("auth_id"));
  // individual Conversations
  const { DirectConversations, current_direct_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );
  // group Conversations
  const { GroupConversations, current_group_conversation } = useSelector(
    (state) => state.conversation.group_chat
  );
  // get conversation for the provided id
  const [
    getConversation,
    { isSuccess: isgetConversationSuccess, data: getConversationData },
  ] = useGetConversationMutation();

  const [logout, { isError, isSuccess: isLogoutSuccess }] = useLogoutMutation();
  const { pathname } = useLocation();
  const Navigates = [
    {
      icon: <MdOutlineChatBubbleOutline />,
      active_icon: <MdOutlineChatBubble />,
      navigate: "/",
      name: "Chats",
    },
    {
      icon: <RiGroupLine />,
      active_icon: <RiGroupFill />,
      navigate: "/group",
      name: "Groups",
    },
    {
      icon: <IoSettingsOutline />,
      active_icon: <IoSettingsSharp />,
      navigate: "/settings",
      name: "Settings",
    },
  ];
  const CurrentIndex = Navigates.findIndex((el) => el.navigate === pathname);
  const [activeIndex, setActiveIndex] = useState(CurrentIndex || 0);
  useEffect(() => {
    const CurrentIndex = Navigates.findIndex((el) => el.navigate === pathname);
    setActiveIndex(CurrentIndex);
  }, [pathname]);
  // user Dialogmenu
  const handletoggleopenDialog = () => {
    setOpenuserDialog((prev) => !prev);
  };

  //  fetching the friends
  const { data: FriendsData, isSuccess: isFriendsSuccess } = useFriendsQuery();
  // update FriendsList
  useEffect(() => {
    if (isFriendsSuccess && FriendsData && FriendsData.data) {
      //  Update the store with users data
      dispatch(updateFriends(FriendsData.data));
    }
  }, [isFriendsSuccess]);

  useEffect(() => {
    if (auth_id) {
      // Connect to the socket and set up event listeners
      connectSocket(auth_id)
        .then(() => {
          setIsSocketConnected(true);
        })
        .catch((error) => {
          console.error("Socket connection error:", error);
        });

      // Set up socket event listeners
      const handleNewFriendRequest = (data) => toast.success(data.message);
      const handleRequestAccepted = (data) => toast.success(data.message);
      const handleRequestSent = (data) => toast.success(data.message);

      socket.on("new_friend_request", handleNewFriendRequest);
      socket.on("request_accepted", handleRequestAccepted);
      socket.on("request_sent", handleRequestSent);

      // Clean up socket event listeners on component unmount
      return () => {
        socket?.off("new_friend_request");
        socket?.off("request_accepted");
        socket?.off("request_sent");
      };
    } else {
      setIsSocketConnected(false);
    }
  }, [auth_id]);

  useEffect(() => {
    if (isSocketConnected) {
      const handleNewMsg = (data) => {
        const { conversation_id, message, chat_type } = data;

        switch (chat_type) {
          case "individual":
            switch (conversation_id.toString()) {
              case current_direct_conversation?.id.toString():
                dispatch(
                  addDirectMessage({
                    id: message?._id,
                    type: "msg",
                    subtype: message?.type,
                    created_at: message?.created_at,
                    message: message?.text,
                    img: message?.file,
                    incoming: message?.to[0] === auth_id,
                    outgoing: message?.from === auth_id,
                  })
                );
                break;
              default:
                socket.emit("update_unreadMsgs", data);
                break;
            }
            break;
          case "group":
            switch (conversation_id) {
              case current_group_conversation?.id:
                dispatch(
                  addGroupMessage({
                    id: message?._id,
                    type: "msg",
                    subtype: message?.type,
                    created_at: message?.created_at,
                    message: message?.text,
                    img: message?.file,
                    incoming: message?.to.includes(auth_id),
                    outgoing: message?.from === auth_id,
                    from: message?.from,
                  })
                );
                break;
              default:
                console.log(
                  "Group conversation not matched, emitting update_unreadMsgs",
                  data
                );
                socket.emit("update_unreadMsgs", data);
                break;
            }
            break;
          default:
            console.log("Unknown chat type");
            break;
        }
      };
      socket.on("new_message", handleNewMsg);

      socket.on("disconnect", function () {
        console.log("Client disconnected");
      });

      return () => {
        socket.off("new_message", handleNewMsg);
      };
    }
  }, [current_direct_conversation, current_group_conversation]);

  useEffect(() => {
    socket.on("on_update_unreadMsg", async (data) => {
      const { chat_type } = data;

      switch (chat_type) {
        case "individual":
          const [update_Direct_Conversation] = DirectConversations.filter(
            (el) => el.id == data.conversation_id
          );
          if (update_Direct_Conversation) {
            dispatch(
              updateDirectConversation({
                ...update_Direct_Conversation,
                msg: `${
                  data.unread?.slice(-1)[0]?.subtype === "Text"
                    ? data.unread?.slice(-1)[0]?.message
                    : `Photo`
                }`,
                outgoing: data.unread?.slice(-1)[0]?.from === auth_id,
                time: data.unread?.slice(-1)[0]?.created_at,
                unread: data.unread.length,
              })
            );
          } else {
            await getConversation({ conversation_id: data.conversation_id });
          }
          break;
        case "group":
          const [update_Group_Conversation] = GroupConversations.filter(
            (el) => el.id == data.conversation_id
          );
          if (update_Group_Conversation) {
            dispatch(
              updateGroupConversation({
                ...update_Group_Conversation,
                msg: data.unread?.slice(-1)[0]?.text,
                from: data.unread.slice(-1)[0]?.from,

                outgoing: data.unread?.slice(-1)[0]?.from === auth_id,
                time: data.unread?.slice(-1)[0]?.created_at,
                unread: data.unread.length,
              })
            );
          } else {
            await getConversation({ conversation_id: data.conversation_id });
          }
          break;
        default:
          console.log("Invalid chat_type at on_update_unreadMsg");
          break;
      }
    });
  }, [
    DirectConversations,
    GroupConversations,
    current_direct_conversation,
    current_group_conversation,
    auth_id,
  ]);

  useEffect(() => {
    const handleUpdateStatus = (data) => {
      const { id, status } = data;
      const [updateConversation] = DirectConversations.filter(
        (el) => el?.user_id == id
      );
      dispatch(
        updateDirectConversation({
          ...updateConversation,
          online: status === "Online",
        })
      );
      dispatch(
        setCurrentDirectConversation({
          ...updateConversation,
          online: status === "Online",
        })
      );
    };
    socket.on("user_status_update", handleUpdateStatus);
    return () => {
      socket.off("user_status_update", handleUpdateStatus);
    };
  }, [DirectConversations]);

  useEffect(() => {
    if (isgetConversationSuccess) {
      switch (true) {
        case isgetConversationSuccess:
          switch (getConversationData.data.type) {
            case "individual":
              dispatch(
                addDirectConversation({
                  conversation: getConversationData.data,
                })
              );
              break;
            case "group":
              dispatch(
                addGroupConversation({ conversation: getConversationData.data })
              );
              break;
            default:
              console.log("getConversationData is null", getConversationData);
              break;
          }
          break;
      }
    }
  }, [isgetConversationSuccess]);

  const handlelogout = async () => {
    await logout();
    handletoggleopenDialog();
  };

  const handleuserAction = (text) => {
    switch (text) {
      case "profile":
        Navigate("/profile");
        handletoggleopenDialog();
        break;
      case "logout":
        handlelogout();
        break;
    }
  };

  // logout  useEffect
  useEffect(() => {
    if (isLogoutSuccess) {
      localStorage.removeItem("auth_id");
      Navigate("/login");
    }
  }, [isLogoutSuccess]);

  useEffect(() => {
    if (isError) {
      toast.error("Failed to logout");
    }
  }, [isError]);
  if (!isSocketConnected) {
    return (
      <div className="loader_container">
        <div className="loader"></div>
      </div>
    );
  }
  const handleChangeactiveIndex = (index) => {
    setActiveIndex(index);
  };
  return (
    <div className="Layout">
      <ToastConfig />
      {/* sidebar */}
      <nav
        className={`navbar ${
          current_direct_conversation || current_group_conversation
            ? "Disable"
            : ""
        }`}
      >
        {/* topfield */}
        <ul className="topfield">
          {Navigates.map(({ icon, active_icon, navigate, name }, index) => (
            <Link
              to={navigate}
              key={index}
              className={`navigate ${activeIndex == index ? "active" : ""}`}
            >
              <li onClick={() => handleChangeactiveIndex(index)}>
                {activeIndex === index ? active_icon : icon}
                <p className="navigate_name">{name}</p>
              </li>
            </Link>
          ))}
        </ul>
        {/* bottomfield */}
        <div className="profile">
          <img src={user.avatar} alt="" onClick={handletoggleopenDialog} />
          {openuserDialog && (
            <div className="userDialog">
              {[
                { text: "profile", icon: <CgProfile /> },
                { text: "logout", icon: <CiLogout /> },
              ].map((el, i) => {
                return (
                  <div
                    className="user_el"
                    key={i}
                    onClick={() => handleuserAction(el.text)}
                  >
                    {el.icon}
                    <p>{el.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </nav>
      <Outlet />
    </div>
  );
};

export default RootPageLayout;
