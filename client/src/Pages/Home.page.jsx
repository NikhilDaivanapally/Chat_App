import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDirectConversations,
  Reset_group_chatProps,
} from "../store/slices/conversation";
import Contact from "../components/Contact/Contact";
import SharedMsgs from "../components/Contact/SharedMsgs";
import Chat from "../components/Conversation/Chat";
import { ResetChat_room, toggleSideBar } from "../store/slices/appSlice";
import { useExistingDirectConversationsQuery } from "../store/slices/apiSlice";
import Loader from "../Loader/Loader";
import DirectConversation from "../components/HomepageComp/DirectConversation";
import { socket } from "../socket";
const HomePage = () => {
  const dispatch = useDispatch();
  const { sideBar, friends } = useSelector((state) => state.app);
  const { _id: auth_id } = JSON.parse(localStorage.getItem("auth_id"));
  const { data, isLoading, isSuccess } = useExistingDirectConversationsQuery();
  // individual Conversations
  const { current_direct_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );
  // group Conversations
  const { current_group_conversation } = useSelector(
    (state) => state.conversation.group_chat
  );
  useEffect(() => {
    dispatch(ResetChat_room());
    dispatch(toggleSideBar({ open: false }));
    dispatch(Reset_group_chatProps());
  }, []);

  useEffect(() => {
    isSuccess &&
      dispatch(fetchDirectConversations({ conversations: data.data }));
  }, [isSuccess]);

  // emiting the event to mark the user as offline  before closing of tab
  useEffect(() => {
    if (friends) {
      const handleChangeStatus = () => {
        socket.emit("exit", { user_id: auth_id, friends });
      };
      window.addEventListener("beforeunload", handleChangeStatus);

      return () => {
        window.removeEventListener("beforeunload", handleChangeStatus);
      };
    }
  }, [friends]);

  return (
    <div className="page">
      {!isLoading ? (
        <>
          <div
            className={`Conversations ${
              current_direct_conversation || current_group_conversation
                ? "Chat_Selected"
                : ""
            }`}
          >
            <DirectConversation />
          </div>
          <div
            className={`Current_Chat ${
              current_direct_conversation || current_group_conversation
                ? "ActiveChat"
                : ""
            } `}
          >
            <Chat />
            {(() => {
              switch (sideBar.type) {
                case "CONTACT":
                  return <Contact />;
                case "STARRED":
                  return <></>;
                case "SHARED":
                  return <SharedMsgs />;
                default:
                  return null;
              }
            })()}
          </div>
        </>
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default HomePage;
