import React, { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { IoIosArrowDown } from "react-icons/io";
import { IoCallOutline, IoVideocamOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket";
import {
  SelectDirectConversation,
  toggleSideBar,
} from "../../store/slices/appSlice";
import { RiArrowLeftSLine } from "react-icons/ri";
import {
  setCurrentDirectConversation,
  setCurrentGroupConversation,
} from "../../store/slices/conversation";
import { GrGroup } from "react-icons/gr";

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
    dispatch(SelectDirectConversation({ room_id: null }));
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
          {chat_type === "individual" && (
            <img
              className="profile"
              src={current_direct_conversation?.avatar}
            />
          )}
          {chat_type === "group" &&
            (current_group_conversation?.img ? (
              <img className="profile" src={current_group_conversation?.img} />
            ) : (
              <GrGroup className="no_groupimg" />
            ))}

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
    </div>
  );
};

export default Header;
