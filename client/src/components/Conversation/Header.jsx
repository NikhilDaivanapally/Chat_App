import React, { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { IoIosArrowDown } from "react-icons/io";
import { IoCallOutline, IoVideocamOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket";
import { SelectDirectConversation, toggleSideBar } from "../../store/slices/appSlice";
import { RiArrowLeftSLine } from "react-icons/ri";
import {
  setCurrentDirectConversation,
  setCurrentGroupConversation,
} from "../../store/slices/conversation";

const Header = () => {
  const dispatch = useDispatch();
  const [istyping, setIstyping] = useState("");

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

  // receive the event when typing start and stop
  useEffect(() => {
    socket.on("Is_Typing", (data) => {
      const { userName, room_id } = data;
      console.log(userName, "typing");

      setIstyping(userName);
    });
    socket.on("Is_Stop_Typing", () => {
      // console.log("NonTyping");
      setIstyping("");
    });

    return () => {
      socket.off("Is_Typing");
      socket.off("Is_Stop_Typing");
    };
  }, []);

  const handleToggleContactsideBar = () => {
    dispatch(toggleSideBar());
  };
  const handleGobackToConversation = () => {
    dispatch(SelectDirectConversation({room_id:null}))
    if (chat_type == "individual") {
      dispatch(setCurrentDirectConversation(null));
    } else {
      dispatch(setCurrentGroupConversation(null));
    }
  };
  return (
    <div className="header">
      {/* left side */}
      <RiArrowLeftSLine
        className="go_back"
        onClick={handleGobackToConversation}
      />
      <div className="Profile" onClick={handleToggleContactsideBar}>
        <div className="profile_container">
          <img
            className="profile"
            src={
              chat_type === "individual"
                ? current_direct_conversation?.avatar
                : current_group_conversation?.img
            }
            alt=""
          />
          {current_direct_conversation?.online && (
            <span className="online_offline"></span>
          )}
        </div>
        <div className="profile-info">
          <p className="profile_name">
            {chat_type === "individual"
              ? current_direct_conversation?.name
              : current_group_conversation?.title}
          </p>
          <p className="profile_status">
            {chat_type == "individual" ? (
              <>
                {istyping
                  ? "Typing..."
                  : current_direct_conversation?.online
                  ? "Online"
                  : "Offline"}
              </>
            ) : (
              <>
                {istyping ? (
                  <>{istyping} is Typing</>
                ) : (
                  <>
                    {current_group_conversation?.users.map((el, i) => {
                      return <span key={i}>{el.userName} ,</span>;
                    })}
                  </>
                )}
              </>
            )}
          </p>
        </div>
      </div>
      {/* right side */}
      {/* <div className="media_controls">
        <ul>
          <li>
            <IoVideocamOutline />
          </li>
          <li>
            <IoCallOutline />
          </li>
          <li>
            <CiSearch />
          </li>
          <li>
            <IoIosArrowDown />
          </li>
        </ul>
      </div> */}
    </div>
  );
};

export default Header;
