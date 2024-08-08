import React, { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { RiUserLine } from "react-icons/ri";
import UpdatesDialog from "./Dialogbox/Updates.Dialog.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  ResetChat_room,
  SelectDirectConversation,
  toggleSideBar,
  updateOnlineStatus,
} from "../../store/slices/appSlice.js";
import { socket } from "../../socket.js";
import ConversationElement from "./ConversationElement.jsx";
import {
  addDirectConversation,
  fetchCurrentDirectMessages,
  Reset_group_chatProps,
  setCurrentDirectConversation,
  updateDirectConversation,
} from "../../store/slices/conversation.js";
import { RxCross2 } from "react-icons/rx";
import { MdOutlineWifiOff } from "react-icons/md";
import { IoPersonAdd, IoPersonAddOutline } from "react-icons/io5";
const DirectConversation = () => {
  const dispatch = useDispatch();
  const [openDialog, setOpenDialog] = useState(false);
  const [searchvalue, setSearchvalue] = useState("");
  const { room_id, OnlineStatus } = useSelector((state) => state.app);
  const {
    DirectConversations,
    current_direct_messages,
    current_direct_conversation,
  } = useSelector((state) => state.conversation.direct_chat);
  let sortedConversations = [...DirectConversations];
  sortedConversations.sort((a, b) => Date.parse(b.time) - Date.parse(a.time));
  const [Conversations, setConversations] = useState(sortedConversations);
  useEffect(() => {
    dispatch(ResetChat_room());
    dispatch(toggleSideBar({ open: false }));
    dispatch(Reset_group_chatProps());
  }, []);

  useEffect(() => {
    setConversations(sortedConversations);
  }, [DirectConversations]);

  const hasPinnedConversations = sortedConversations.some(
    (el) => el?.pinned == "true"
  );
  const handleDialogState = () => {
    setOpenDialog((prev) => !prev);
  };

  useEffect(() => {
    dispatch(
      updateDirectConversation({
        ...current_direct_conversation,
        outgoing: current_direct_messages?.slice(-1)[0]?.outgoing,
        msg: `${
          current_direct_messages?.slice(-1)[0]?.subtype === "Text"
            ? current_direct_messages?.slice(-1)[0]?.message
            : `Photo`
        }`,
        time: current_direct_messages?.slice(-1)[0]?.created_at,
      })
    );
  }, [current_direct_messages]);

  useEffect(() => {
    const handleStartChat = (data) => {
      const existing_conversation = DirectConversations.find(
        (el) => el.id === data._id
      );
      // console.log(existing_conversation);
      if (existing_conversation) {
        dispatch(updateDirectConversation({ conversation: data }));
      } else {
        console.log("adding chat");
        // add direct conversation
        dispatch(addDirectConversation({ conversation: data }));
      }
      dispatch(SelectDirectConversation({ room_id: data._id }));
      handleDialogState();
    };
    socket.on("start_chat", handleStartChat);
    return () => {
      socket?.off("start_chat");
    };
  }, []);

  useEffect(() => {
    const currentChat = DirectConversations.find((el) => el?.id === room_id);
    room_id &&
      socket.emit(
        "get_messages",
        { conversation_id: currentChat?.id },
        (data) => {
          // console.log(data, "messages");
          dispatch(fetchCurrentDirectMessages({ messages: data }));
        }
      );
    dispatch(setCurrentDirectConversation(currentChat));
  }, [room_id]);

  const handleInputChange = (e) => {
    let value = e.target.value.toLowerCase();
    const regex = new RegExp(`^${value?.trim()}`, "i");
    const filteredConversations = value
      ? sortedConversations.filter((el) => regex.test(el.name.toLowerCase()))
      : sortedConversations;
    setConversations(filteredConversations);
  };
  const handleResetSearchvalue = () => {
    setSearchvalue("");
    setConversations(sortedConversations);
  };

  return (
    <>
      <div
        className={`chats_Sections`}
      >
        <div className="Top_Section">
          <div className="Top_bar">
            <p className="left title">Chats</p>
            <div className="right">
              <div onClick={handleDialogState}>
                {openDialog ? <IoPersonAdd /> : <IoPersonAddOutline />}
              </div>
            </div>
          </div>
          <div className="Search_box bottom_bar">
            <CiSearch />
            <input
              type="text"
              className="Search_inpt"
              placeholder="Search"
              value={searchvalue}
              onChange={(e) => setSearchvalue(e.target.value)}
              onInput={handleInputChange}
            />
            {searchvalue && (
              <RxCross2
                className="clear_search"
                onClick={handleResetSearchvalue}
              />
            )}
          </div>
        </div>
        <div className="Chats_Container">
          {!OnlineStatus && (
            <div className="onlinestatus">
              <MdOutlineWifiOff className="status_icon" />
              <div className="status_info">
                <p>Computer is Offline</p>
                <span>Make sure that u have active internet</span>
              </div>
              <RxCross2
                className="close_icon"
                onClick={() => dispatch(updateOnlineStatus({ status: true }))}
              />
            </div>
          )}
          <>
            {DirectConversations.length > 0 ? (
              <>
                {hasPinnedConversations && (
                  <div className="Pinned_Chats_Container">
                    <p className="title">Pinned</p>
                    <div className="Pinned_Chats">
                      {Conversations.filter((el) => el.pinned).map(
                        (chat, index) => {
                          return (
                            <ConversationElement chat={chat} key={index} />
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
                <div className="All_Chats_Container">
                  <p className="title">All Chats</p>
                  <div className="All_Chats">
                    {Conversations.filter((el) => !el.pinned).map(
                      (chat, index) => {
                        return <ConversationElement chat={chat} key={index} />;
                      }
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p>No Chats</p>
            )}
          </>
        </div>
      </div>
      {openDialog && (
        <UpdatesDialog
          openDialog={openDialog}
          handlecloseDialog={handleDialogState}
        />
      )}
    </>
  );
};

export default DirectConversation;
