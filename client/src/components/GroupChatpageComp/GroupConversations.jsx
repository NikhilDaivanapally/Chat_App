import React, { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { FaPlus } from "react-icons/fa6";

import { useDispatch, useSelector } from "react-redux";
import {
  addGroupConversation,
  updateGroupConversation,
} from "../../store/slices/conversation";
import GroupDialog from "./GroupDialog/GroupDialog";
import { socket } from "../../socket";
import Groupchat from "./Groupchat";
import {
  SelectGroupConversation,
  updateOnlineStatus,
} from "../../store/slices/appSlice";
import { getAuthState } from "../../store/slices/authSlice";
import { MdOutlineWifiOff } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
const GroupConversations = () => {
  const auth = useSelector(getAuthState);
  const dispatch = useDispatch();
  const [openDialog, setOpenDialog] = useState(false);

  const handleopenDialog = () => {
    setOpenDialog(true);
  };
  const handlecloseDialog = () => {
    setOpenDialog(false);
  };
  const {
    GroupConversations,
    current_group_conversation,
    current_group_messages,
  } = useSelector((state) => state.conversation.group_chat);

  const hasTime = GroupConversations.filter((el) => el.time);
  hasTime.sort((a, b) => Date.parse(b?.time) - Date.parse(a?.time));

  const hasnoTime = GroupConversations.filter((el) => !el.time);

  const sortedConversations = [...hasTime, ...hasnoTime];

  const [Conversations, setConversations] = useState(sortedConversations);
  const [searchvalue, setSearchvalue] = useState("");
  useEffect(() => {
    setConversations(sortedConversations);
  }, [GroupConversations]);

  // returns true if GroupConversations had an pinned one's else returns false
  const hasPinnedConversations = sortedConversations.some(
    (el) => el.pinned == "true"
  );

  const { OnlineStatus } = useSelector((state) => state.app);
  useEffect(() => {
    dispatch(
      updateGroupConversation({
        ...current_group_conversation,
        outgoing: current_group_messages?.slice(-1)[0]?.outgoing,
        msg: `${
          current_group_messages?.slice(-1)[0]?.subtype === "Text"
            ? current_group_messages?.slice(-1)[0]?.message
            : `Photo`
        }`,
        from: current_group_messages?.slice(-1)[0]?.from,

        time: current_group_messages?.slice(-1)[0]?.created_at,
      })
    );
  }, [current_group_messages]);

  useEffect(() => {
    const handlenewGroupChat = (data) => {
      console.log(data);

      const existing_conversation = GroupConversations.find(
        (el) => el.id === data._id
      );
      if (existing_conversation) {
        dispatch(updateGroupConversation({ conversation: data }));
      } else {
        // add direct conversation
        dispatch(addGroupConversation({ conversation: data }));
      }
      // dispatch(SelectGroupConversation({ room_id: data._id }));
      // handlecloseDialog();
    };
    socket.on("new_groupChat", handlenewGroupChat);
    return () => {
      socket.off("new_groupChat", handlenewGroupChat);
    };
  }, []);

  useEffect(() => {
    const handlenewGroupChat = (data) => {
      console.log(data, "admin");

      const existing_conversation = GroupConversations.find(
        (el) => el.id === data._id
      );
      if (existing_conversation) {
        dispatch(updateGroupConversation({ conversation: data }));
      } else {
        // add direct conversation
        dispatch(addGroupConversation({ conversation: data }));
      }
      dispatch(SelectGroupConversation({ room_id: data._id }));
      handlecloseDialog();
    };
    socket.on("new_groupChat_admin", handlenewGroupChat);
    return () => {
      socket.off("new_groupChat_admin", handlenewGroupChat);
    };
  }, []);

  const handleInputChange = (e) => {
    let value = e.target.value.toLowerCase();
    const regex = new RegExp(`^${value?.trim()}`, "i");
    const filteredConversations = value
      ? sortedConversations.filter((el) => regex.test(el.title.toLowerCase()))
      : sortedConversations;
    setConversations(filteredConversations);
    setSearchvalue(value);
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
            <p className="left title">Group</p>
            {/* createNewGroup */}
            <button className="Create_group" onClick={handleopenDialog}>
              Create Group
              <FaPlus />
            </button>
          </div>
          <div className="Search_box bottom_bar">
            <CiSearch className="search_icon" />
            <input
              type="text"
              className="Search_inpt"
              placeholder="Search..."
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
          {/* <div className="Create_Group">
            <input type="text" placeholder="Create a new Group" />
            <FaPlus onClick={handleopenDialog} />
          </div> */}
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
            {GroupConversations.length > 0 ? (
              <>
                {hasPinnedConversations && (
                  <div className="Pinned_Chats_Container">
                    <p className="title">Pinned</p>
                    <div className="Pinned_Chats">
                      {Conversations.filter((el) => el.pinned).map(
                        (chat, index) => {
                          return <Groupchat chat={chat} key={index} />;
                        }
                      )}
                    </div>
                  </div>
                )}
                <div className="All_Chats_Container">
                  <p className="title">All Group Chats</p>
                  <div className="All_Chats">
                    {Conversations.filter((el) => !el.pinned).map(
                      (chat, index) => {
                        return <Groupchat chat={chat} key={index} />;
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
        <GroupDialog
          openDialog={openDialog}
          handlecloseDialog={handlecloseDialog}
        />
      )}
    </>
  );
};

export default GroupConversations;
