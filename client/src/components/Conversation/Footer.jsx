import React, { useRef, useState, useEffect } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { FaCamera } from "react-icons/fa";
import { ImAttachment } from "react-icons/im";
import { IoMdPhotos } from "react-icons/io";
import { IoDocumentText } from "react-icons/io5";
import { BsSend } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { socket } from "../../socket";
import Dialog from "../Dialog/Dialog";
import {
  addDirectMessage,
  addGroupMessage,
} from "../../store/slices/conversation";
import myThrottle from "../../utils/myThrottle";

const Footer = ({ setIsNonTextmsg, isNonTextmsg }) => {
  // console.log(setIsNonTextmsg);
  const { _id: auth_id, userName } = JSON.parse(
    localStorage.getItem("auth_id")
  );
  const [openEmojipicker, setOpenEmojipicker] = useState(false);
  const [openActions, setOpenActions] = useState(false);
  const [inputMsg, setInputMsg] = useState("");
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const { room_id, chat_type } = useSelector((state) => state.app);

  const {
    DirectConversations,
    current_direct_conversation,
    current_direct_messages,
  } = useSelector((state) => state.conversation.direct_chat);

  const {
    GroupConversations,
    current_group_conversation,
    current_group_messages,
  } = useSelector((state) => state.conversation.group_chat);

  const Actions_array = [
    { icon: <IoDocumentText />, action: "Documents" },
    { icon: <IoMdPhotos />, action: "Photos & Videos" },
  ];

  const userList = current_group_conversation?.users.map((el) => {
    return el._id;
  });

  // handle the emoji select
  const handleEmojiClick = (emoji) => {
    setInputMsg((prev) => prev + emoji);
    handleToggleEmojiPicker();
  };
  const containsUrl = (text) => /(https?:\/\/[^\s]+)/g.test(text);

  const linkify = (text) =>
    text.replace(
      /(https?:\/\/[^\s]+)/g,
      (url) => `<a href="${url}" target="_blank">${url}</a>`
    );

  const handleInputChange = (e) => setInputMsg(e.target.value);
  const handleOpenActions = () => setOpenActions((prev) => !prev);
  const handleToggleEmojiPicker = () => setOpenEmojipicker((prev) => !prev);

  // Handle send Message
  const handleSendMsg = (e) => {
    e.preventDefault();
    const to =
      chat_type === "individual"
        ? [current_direct_conversation.user_id]
        : userList;
    switch (true) {
      case inputMsg && chat_type === "individual":
        dispatch(
          addDirectMessage({
            id: "",
            type: "msg",
            subtype: "Text",
            message: inputMsg,

            created_at: new Date().toISOString(),
            incoming: false,
            outgoing: true,
            status: "pending",
          })
        );
        break;
      case inputMsg && chat_type !== "individual":
        dispatch(
          addGroupMessage({
            id: "",
            type: "msg",
            subtype: "Text",
            message: inputMsg,

            created_at: new Date().toISOString(),
            incoming: false,
            outgoing: true,
            status: "pending",
          })
        );
        break;
      default:
        break;
    }

    socket.emit("text_message", {
      conversation_id: room_id,
      message: linkify(inputMsg),
      from: auth_id,
      to,
      type: containsUrl(inputMsg) ? "Link" : "Text",
      chat_type,
    });
    setInputMsg("");
  };
  // Handle emit the Typing and Stop_Typing event
  const handleTypingStat = (() => {
    let typingTimeout;
    let isTyping = false;
    const current_conversation =
      chat_type === "individual"
        ? current_direct_conversation?.user_id
        : userList;
    return () => {
      if (!isTyping) {
        socket.emit("Typing", {
          room_id,
          currentUser: { auth_id, userName },
          type: chat_type,
          current_conversation,
        });
        isTyping = true;
      }

      if (typingTimeout) clearTimeout(typingTimeout);

      typingTimeout = setTimeout(() => {
        socket.emit("Stop_Typing", {
          room_id,
          currentUser: { auth_id, userName },
          type: chat_type,
          current_conversation,
        });
        isTyping = false;
      }, 3000);
    };
  })();

  // function myThrottle(func, delay) {
  //   let timerFlag = null;

  //   return () => {
  //     if (timerFlag === null) {
  //       func();
  //       timerFlag = setTimeout(() => {
  //         timerFlag = null;
  //       }, delay);
  //     }
  //   };
  // }

  const handleInputTyping = myThrottle(handleTypingStat, 2000);

  // make input to be focused on defined dependencies
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [current_direct_messages, current_direct_conversation, auth_id]);
  useEffect(() => {
    isNonTextmsg && handleOpenActions();
  }, [isNonTextmsg]);
  return (
    <form onSubmit={handleSendMsg}>
      <div className="footer">
        <div className="send_msg_inpt_Container">
          <div className="attachments">
            {openActions && (
              <Dialog onClose={handleOpenActions}>
                <div className="Actions_container">
                  {Actions_array.map((el, i) => (
                    <label
                      key={`${el}_${i}`}
                      className={`action ${el.action.split(" & ").join("_")}`}
                    >
                      {el.icon}
                      <p>{el.action}</p>
                      <input
                        type="file"
                        hidden
                        multiple
                        onChange={(e) => {
                          setIsNonTextmsg(Object.values(e.target.files));
                        }}
                      />
                    </label>
                  ))}
                </div>
              </Dialog>
              // <div className="attachement_container" onClick={handleOpenActions}>
              // </div>
            )}
            <ImAttachment onClick={handleOpenActions} />
          </div>

          <div className="input">
            <input
              ref={inputRef}
              value={inputMsg}
              onChange={handleInputChange}
              onInput={handleInputTyping}
              type="text"
              placeholder=" write a message..."
            />
          </div>

          <div className="emoji">
            {openEmojipicker && (
              <div className="emoji_picker">
                <Picker
                  theme="light"
                  data={data}
                  onEmojiSelect={(emoji) => handleEmojiClick(emoji.native)}
                />
              </div>
            )}
            <BsEmojiSmile onClick={handleToggleEmojiPicker} />
          </div>
        </div>
        <button className="send_msg_btn" type="submit">
          <BsSend />
        </button>
      </div>
    </form>
  );
};

export default Footer;
