import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import GroupConversations from "../components/GroupChatpageComp/GroupConversations";
import { useExistingGroupConversationsQuery } from "../store/slices/apiSlice";
import {
  fetchGroupConversations,
  Reset_direct_chatProps,
} from "../store/slices/conversation";
import Chat from "../components/Conversation/Chat";
import Contact from "../components/Contact/Contact";
import SharedMsgs from "../components/Contact/SharedMsgs";
import { ResetChat_room, toggleSideBar } from "../store/slices/appSlice";
import Loader from "../Loader/Loader";
const GroupPage = () => {
  const dispatch = useDispatch();
  const { sideBar } = useSelector((state) => state.app);
  // individual Conversations
  const { current_direct_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );
  // group Conversations
  const { current_group_conversation } = useSelector(
    (state) => state.conversation.group_chat
  );
  const { data, isLoading, isSuccess } = useExistingGroupConversationsQuery();
  useEffect(() => {
    dispatch(ResetChat_room());
    dispatch(toggleSideBar({ open: false }));

    dispatch(Reset_direct_chatProps());
  }, []);
  useEffect(() => {
    isSuccess &&
      dispatch(fetchGroupConversations({ conversations: data.data }));
  }, [isSuccess]);
  return (
    <div className=" page">
      {!isLoading ? (
        <>
          <div
            className={`Conversations ${
              current_direct_conversation || current_group_conversation
                ? "Chat_Selected"
                : ""
            }`}
          >
            <GroupConversations />
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

export default GroupPage;
