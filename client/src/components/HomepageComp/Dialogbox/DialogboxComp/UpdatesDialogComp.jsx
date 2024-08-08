import React from "react";
import { socket } from "../../../../socket";
import { useSelector } from "react-redux";
import { getAuthState } from "../../../../store/slices/authSlice";
import { FaUserCircle } from "react-icons/fa";
import { BsChatRightTextFill } from "react-icons/bs";
import { RxCross2 } from "react-icons/rx";

const User = ({ _id, userName, avatar, online }) => {
  const auth_user = useSelector(getAuthState);
  // console.log(_id,userName)
  return (
    <div className="user">
      <div className="img_contatiner">
        {avatar ? (
          <img src={avatar} alt="" />
        ) : (
          <FaUserCircle className="avatar" />
        )}
        {online && <span className="online_offline"></span>}
      </div>
      <div className="info">
        <p>{userName}</p>
      </div>
      <button
        className="AddTo_friend"
        onClick={() => {
          socket.emit("friend_request", { to: _id, from: auth_user._id });
        }}
      >
        send Request
        {/* <IoIosAdd /> */}
      </button>
    </div>
  );
};

const FriendRequest = ({ _id, sender }) => {
  return (
    <div className="user">
      <div className="img_contatiner">
        {sender.avatar ? (
          <img src={sender.avatar} alt="" />
        ) : (
          <FaUserCircle className="avatar" />
        )}
        {sender.status && <span className="online_offline"></span>}
      </div>
      <div className="info">
        <p>{sender.userName}</p>
      </div>
      <div className="controls">
        <button
          onClick={() => {
            socket.emit("accept_request", { request_id: _id });
          }}
        >
          Accept
        </button>
        <button>Reject</button>
      </div>
    </div>
  );
};

const Friend = ({ _id, userName, avatar, online }) => {
  const auth_user = useSelector(getAuthState);
  return (
    <div className="user">
      <div className="img_contatiner">
        {avatar ? (
          <img src={avatar} alt="" />
        ) : (
          <FaUserCircle className="avatar" />
        )}
        {online && <span className="online_offline">{userName}</span>}
      </div>
      <div className="info">
        <p>{userName}</p>
      </div>

      <div className="controls">
        <BsChatRightTextFill
          className="msg"
          onClick={() => {
            // start a new conversation
            socket.emit("start_conversation", {
              to: _id,
              from: auth_user._id,
              chat_type: "individual",
            });
          }}
        />
        <RxCross2 className="remove" />
      </div>
    </div>
  );
};
export { User, FriendRequest, Friend };
