// import { faker } from "@faker-js/faker";
import { createSlice, current } from "@reduxjs/toolkit";
const initialState = {
  direct_chat: {
    DirectConversations: [],
    current_direct_conversation: null,
    current_direct_messages: [],
  },
  group_chat: {
    GroupConversations: [],
    current_group_conversation: null,
    current_group_messages: [],
  },
  fullImagePreview: null,
};

const slice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    fetchDirectConversations(state, action) {
      const auth = JSON.parse(localStorage.getItem("auth_id")) || null;
      // console.log(action.payload.DirectConversations); // conversation _id & participants & messages

      const list = action.payload.conversations.map((el) => {
        // console.log(el); // participants array populated & messages
        if (el.messages.length > 0) {
          const user = el.participants.find(
            (elm) => elm?._id.toString() != auth._id?.toString()
          );
          // console.log(user, user_id);
          return {
            id: el?._id,
            user_id: user?._id,
            name: user.userName,
            online: user?.status === "Online",
            avatar: user?.avatar,
            msgImg: user?.img,
            msg:
              el?.messages?.slice(-1)[0]?.type == "Media"
                ? "Photo"
                : el?.messages?.slice(-1)[0]?.text,
            outgoing:
              el?.messages?.slice(-1)[0]?.from.toString() ===
              auth?._id.toString(),
            time: el?.messages?.slice(-1)[0]?.created_at || "",
            unread: `${
              el?.unreadmessages.length > 0
                ? `${
                    auth._id == el?.unreadmessages?.slice(-1)[0]?.from
                      ? ""
                      : el?.unreadmessages.length
                  }`
                : ``
            }`,
            pinned: false,
            about: user?.about,
          };
        } else {
          return null;
        }
      });
      const filterList = list.filter((val) => val);
      state.direct_chat.DirectConversations = filterList;
    },
    fetchGroupConversations(state, action) {
      const auth = JSON.parse(localStorage.getItem("auth_id")) || null;
      const list = action.payload.conversations.map((el) => {
        return {
          id: el?._id,
          title: el?.title,
          img: el?.avatar,
          users: el?.participants,
          admin: el?.admin,

          msg:
            el?.messages?.slice(-1)[0]?.type == "Media"
              ? "Photo"
              : el?.messages?.slice(-1)[0]?.text,
          from: el?.messages.slice(-1)[0]?.from,
          outgoing:
            el?.messages?.slice(-1)[0]?.from.toString() ===
            auth?._id.toString(),
          time: el?.messages?.slice(-1)[0]?.created_at || "",
          unread: `${
            el?.unreadmessages.length > 0
              ? `${
                  auth._id == el?.unreadmessages?.slice(-1)[0]?.from
                    ? ""
                    : el?.unreadmessages?.length
                }`
              : ``
          }`,
        };
      });
      state.group_chat.GroupConversations = list;
    },
    updateDirectConversation(state, action) {
      const this_conversation = action.payload;
      state.direct_chat.DirectConversations =
        state.direct_chat.DirectConversations.map((el) => {
          if (el?.id !== this_conversation?.id) {
            return el;
          } else {
            return action.payload;
          }
        });
    },
    updateGroupConversation(state, action) {
      const this_conversation = action.payload;
      state.group_chat.GroupConversations =
        state.group_chat.GroupConversations.map((el) => {
          if (el?.id !== this_conversation?.id) {
            return el;
          } else {
            return action.payload;
          }
        });
    },
    addDirectConversation(state, action) {
      const auth = JSON.parse(localStorage.getItem("auth_id")) || null;

      const this_conversation = action.payload.conversation;
      // console.log(this_conversation, user);
      const user = this_conversation.participants.find(
        (elm) => elm?._id.toString() !== auth?._id
      );
      state.direct_chat.DirectConversations =
        state.direct_chat.DirectConversations.filter(
          (el) => el?.id !== this_conversation._id
        );
      state.direct_chat.DirectConversations.push({
        id: this_conversation?._id,
        user_id: user?._id,
        name: user?.userName,
        online: user?.status === "Online",
        avatar: user?.avatar,
        msgImg: user?.img,
        msg:
          this_conversation?.messages?.slice(-1)[0]?.type == "Media"
            ? "Photo"
            : this_conversation?.messages?.slice(-1)[0]?.text,
        outgoing:
          this_conversation?.messages?.slice(-1)[0]?.from.toString() ===
          auth?._id.toString(),
        time: this_conversation?.messages?.slice(-1)[0]?.created_at || "",
        unread: this_conversation?.unreadmessages?.length,
        pinned: false,
        about: user?.about,
      });
    },
    addGroupConversation(state, action) {
      const auth = JSON.parse(localStorage.getItem("auth_id")) || null;

      const this_conversation = action.payload.conversation;
      state.group_chat.GroupConversations =
        state.group_chat.GroupConversations.filter(
          (el) => el?.id !== this_conversation._id
        );
      state.group_chat.GroupConversations.push({
        id: this_conversation?._id,
        title: this_conversation?.title,
        img: this_conversation?.avatar,
        admin: this_conversation?.admin,
        users: this_conversation?.participants,
        msg:
          this_conversation?.messages?.slice(-1)[0]?.type == "Media"
            ? "Photo"
            : this_conversation?.messages?.slice(-1)[0]?.text,
        from: this_conversation?.messages.slice(-1)[0]?.from,

        outgoing:
          this_conversation?.messages?.slice(-1)[0]?.from.toString() ===
          auth?._id.toString(),
        time: this_conversation?.messages?.slice(-1)[0]?.created_at || "",
        unread: `${
          this_conversation?.unreadmessages.length > 0
            ? `${
                auth._id ==
                this_conversation?.unreadmessages?.slice(-1)[0]?.from
                  ? ""
                  : this_conversation?.unreadmessages?.length
              }`
            : ``
        }`,
      });
    },
    fetchCurrentDirectMessages(state, action) {
      const { messages } = action.payload;
      const auth = JSON.parse(localStorage.getItem("auth_id")) || null;

      if (messages?.length > 0) {
        const formatted_messages = messages.map((el) => ({
          id: el?._id,
          type: "msg",
          subtype: el?.type,
          message: el?.text,
          img: el?.file,

          created_at: el?.created_at,
          incoming: el?.to[0] == auth?._id,
          outgoing: el?.from == auth?._id,
          status: "sent",
        }));
        state.direct_chat.current_direct_messages = formatted_messages;
      }
    },
    fetchCurrentGroupMessages(state, action) {
      const { messages } = action.payload;
      const auth = JSON.parse(localStorage.getItem("auth_id")) || null;

      const formatted_messages = messages.map((el) => ({
        id: el?._id,
        type: "msg",
        subtype: el?.type,
        message: el?.text,
        img: el?.file,
        created_at: el?.created_at,
        incoming: el?.to.includes(auth?._id),
        outgoing: el?.from == auth?._id,
        from: el?.from,
      }));
      state.group_chat.current_group_messages = formatted_messages;
    },

    setCurrentDirectConversation(state, action) {
      // console.log(action.payload, "cuur2");
      state.direct_chat.current_direct_conversation = action.payload;
    },
    setCurrentGroupConversation(state, action) {
      state.group_chat.current_group_conversation = action.payload;
    },
    addDirectMessage(state, action) {
      const current_messages = state.direct_chat.current_direct_messages;

      if (current_messages?.slice(-1)[0]?.status == "pending") {
        current_messages.pop();
      }
      current_messages.push(action.payload);
    },
    addGroupMessage(state, action) {
      const current_messages = state.group_chat.current_group_messages;

      if (current_messages?.slice(-1)[0]?.status == "pending") {
        current_messages.pop();
      }
      current_messages.push(action.payload);
    },
    Reset_direct_chatProps(state) {
      state.direct_chat.current_direct_conversation = null;
      state.direct_chat.current_direct_messages = [];
    },
    Reset_group_chatProps(state) {
      state.group_chat.current_group_conversation = null;
      state.group_chat.current_group_messages = [];
    },
    setfullImagePreview(state, action) {
      console.log(action.payload);
      state.fullImagePreview = action.payload.fullviewImg;
    },
  },
});

export const {
  fetchDirectConversations,
  fetchGroupConversations,
  updateDirectConversation,
  updateGroupConversation,
  addDirectConversation,
  addGroupConversation,
  fetchCurrentDirectMessages,
  fetchCurrentGroupMessages,
  setCurrentDirectConversation,
  setCurrentGroupConversation,
  addDirectMessage,
  addGroupMessage,
  Reset_direct_chatProps,
  Reset_group_chatProps,
  setfullImagePreview,
} = slice.actions;

export default slice.reducer;
