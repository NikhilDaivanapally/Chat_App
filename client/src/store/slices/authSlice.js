import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "authState",
  initialState: {
    user: JSON.parse(localStorage.getItem("auth_id")) || null,
  },
  reducers: {
    UpdateAuthState(state, action) {
      state.user = action.payload;
    },
  },
});

export const getAuthState = (state) => state.auth.user;

export const { UpdateAuthState } = slice.actions;

export default slice.reducer;
