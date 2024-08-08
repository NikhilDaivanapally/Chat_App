import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  sideBar: {
    open: false,
    type: "CONTACT", // can be CONTACT, STARRED, SHARED
  },
  users: [], // all users of app who are not friends and not requested yet
  friends: [], // all friends
  friendRequests: [], // all friend requests
  chat_type: null,
  room_id: null,
  OnlineStatus: null,
};

const Slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // Toggle Sidebar
    toggleSideBar(state, action) {
      if (action.payload) {
        state.sideBar.open = action.payload.open;
      } else {
        state.sideBar.open = !state.sideBar.open;
      }
    },
    updateSidebarType(state, action) {
      state.sideBar.type = action.payload.type;
    },
    SelectDirectConversation(state, action) {
      // console.log(action.payload.room_id,'room_id')
      state.chat_type = "individual";
      state.room_id = action.payload.room_id;
    },
    SelectGroupConversation(state, action) {
      state.chat_type = "group";
      state.room_id = action.payload.room_id;
    },
    ResetChat_room(state) {
      state.chat_type = null;
      state.room_id = null;
    },
    updateUsers(state, action) {
      // console.log(action.payload, "users through redux");
      state.users = action.payload;
    },
    updateFriends(state, action) {
      // console.log(action.payload, "friendsList through redux");
      state.friends = action.payload;
    },
    updateFriendRequests(state, action) {
      // console.log(action.payload, "friendReqs through redux");
      state.friendRequests = action.payload;
    },
    updateOnlineStatus(state, action) {
      state.OnlineStatus = action.payload.status;
    },
  },
});

// export const getUsers = (state) => state.app.users;
// export const getFriends = (state) => state.app.friends;
// export const getFriendRequests = (state) => state.app.friendRequests;
// export const getsideBarState = (state) => state.app.sideBar;
export const {
  toggleSideBar,
  SelectDirectConversation,
  SelectGroupConversation,
  updateUsers,
  updateFriends,
  updateFriendRequests,
  updateSidebarType,
  ResetChat_room,
  updateOnlineStatus,
} = Slice.actions;
export default Slice.reducer;
