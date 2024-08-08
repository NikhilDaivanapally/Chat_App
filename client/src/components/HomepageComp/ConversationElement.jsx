import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateDirectConversation } from "../../store/slices/conversation";
import { SelectDirectConversation } from "../../store/slices/appSlice";
import { socket } from "../../socket";
import { MdCameraAlt, MdOutlineCameraAlt } from "react-icons/md";
import { IoCameraOutline } from "react-icons/io5";
import formatTime2 from "../../utils/formatTime2";
import formatTime from "../../utils/formatTime";
import formatDate from "../../utils/formatDate";

const ConversationElement = ({ chat }) => {
  const dispatch = useDispatch();

  const { DirectConversations } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const { msgImg, name, msg, avatar, time, unread, online, outgoing, id } =
    chat;
  let Time = "";
  if (time) {
    let formattedTime = formatTime2(time);
    switch (formattedTime) {
      case "Today":
        const val = formatTime(time);
        Time = val.Time;
        break;
      case "Yesterday":
        Time = formattedTime;
        break;
      default:
        Time = new Date(formattedTime).toLocaleDateString();
        break;
    }
  }

  const handleSelectConversation = () => {
    // make chat selected

    dispatch(SelectDirectConversation({ room_id: id }));
    const [updateConversation] = DirectConversations.filter(
      (el) => el.id == id
    );
    // make unread messages to 0
    if (updateConversation.unread) {
      socket.emit("clear_unread", { conversation_id: id });
      dispatch(
        updateDirectConversation({
          ...updateConversation,
          unread: 0,
        })
      );
    }
  };
  const { room_id } = useSelector((state) => state.app);

  return (
    <div
      className={`friend ${room_id == id && "selected"}`}
      onClick={handleSelectConversation}
    >
      <div className="image_container">
        <img src={avatar} alt="" />
        {online && <span className="online_offline"></span>}
      </div>
      <div className="info">
        <p className="friend_name">{name}</p>
        <span className="friend_msg">
          {outgoing ? "You -" : ""}
          {msgImg && <MdOutlineCameraAlt />} {msg ? msg : ""}
        </span>
      </div>
      <div className="lasttime_noof_msg">
        <span className="lasttime_msg">{Time}</span>
        {Boolean(unread) && (
          <span className="noof_msg">
            {unread > 99 ? `${unread}+` : unread}
          </span>
        )}
      </div>
    </div>
  );
};

export default ConversationElement;
