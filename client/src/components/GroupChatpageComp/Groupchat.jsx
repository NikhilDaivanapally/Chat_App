import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateGroupConversation } from "../../store/slices/conversation";
import { SelectGroupConversation } from "../../store/slices/appSlice";
import { socket } from "../../socket";
import formatTime2 from "../../utils/formatTime2";
import formatTime from "../../utils/formatTime";
import { GrGroup } from "react-icons/gr";
const Groupchat = ({ chat }) => {
  const { friends } = useSelector((state) => state.app);
  let user;
  if (!chat.outgoing) {
    const foundUser = friends.find((user) => user._id == chat.from);
    if (foundUser) {
      user = {
        avatar: foundUser.avatar,
        userName: foundUser.userName,
      };
    }
  }
  const dispatch = useDispatch();
  const { GroupConversations } = useSelector(
    (state) => state.conversation.group_chat
  );
  const { img, title, msg, time, unread, online, outgoing, id } = chat;

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
    dispatch(SelectGroupConversation({ room_id: id }));
    const [updateConversation] = GroupConversations.filter((el) => el.id == id);
    // make unread messages to 0
    if (Number(updateConversation.unread)) {
      socket.emit("clear_unread", { conversation_id: id });
      dispatch(
        updateGroupConversation({
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
        {img ? <img src={img} alt="" /> : <GrGroup className="no_img" />}
        {online && <span className="online_offline"></span>}
      </div>
      <div className="info">
        <p className="friend_name">{title}</p>
        <span className="friend_msg">{`${
          outgoing ? "You -" : `${user?.userName ? `${user.userName} -` : ""}`
        }  ${msg ? msg : ""}`}</span>
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

export default Groupchat;
