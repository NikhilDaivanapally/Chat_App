import { useState } from "react";
import { CiImageOn } from "react-icons/ci";
import { HiDownload } from "react-icons/hi";
import { IoIosArrowDown } from "react-icons/io";
import "./Chat.css";
import { useDispatch, useSelector } from "react-redux";
import { LiaCheckDoubleSolid } from "react-icons/lia";
import { LuClock4 } from "react-icons/lu";
import { setfullImagePreview } from "../../store/slices/conversation";
import formatTime from "../../utils/formatTime";
import formatTime2 from "../../utils/formatTime2";

const TextMsg = ({ el }) => {
  const { chat_type } = useSelector((state) => state.app);
  const { friends } = useSelector((state) => state.app);
  let user;
  if (!el.outgoing) {
    const foundUser = friends.find((user) => el.from == user._id);
    if (foundUser) {
      user = {
        avatar: foundUser.avatar,
        userName: foundUser.userName,
      };
    }
  }
  const [openMoreOptions, setOpenMoreOptions] = useState(false);
  const handleMoreOptions = () => {
    setOpenMoreOptions((prev) => !prev);
  };
  const { Time } = formatTime(el.created_at);

  return (
    <div className={`Text_msg ${el.incoming ? "start" : "end"}`}>
      {openMoreOptions && (
        <div className={`Menu_options`}>
          <p className="option">Reply</p>
          <p className="option">Delete</p>
        </div>
      )}

      <IoIosArrowDown
        className={`Menu_btn ${openMoreOptions ? "stay" : "close"}`}
        onClick={handleMoreOptions}
      ></IoIosArrowDown>

      {chat_type !== "individual" && el.incoming && (
        <div className="user_profile">
          <img className="img" src={user?.avatar} alt="" />
        </div>
      )}
      <div className="msg_info">
        {chat_type !== "individual" && (
          <p className="userName">{user?.userName}</p>
        )}
        <p>{el.message}</p>
        <div className="time_Stamp">
          <p className="">{Time}</p>
          {!el.incoming ? (
            el.status == "pending" ? (
              <LuClock4 />
            ) : (
              <LiaCheckDoubleSolid />
            )
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};
const MediaMsg = ({ el }) => {
  const dispatch = useDispatch();
  const { chat_type } = useSelector((state) => state.app);
  const { friends } = useSelector((state) => state.app);
  let user;
  if (!el.outgoing) {
    const foundUser = friends.find((user) => el.from == user._id);
    if (foundUser) {
      user = {
        avatar: foundUser.avatar,
        userName: foundUser.userName,
      };
    }
  }
  const [openMoreOptions, setOpenMoreOptions] = useState(false);
  const handleMoreOptions = () => {
    setOpenMoreOptions((prev) => !prev);
  };

  const { Time } = formatTime(el.created_at);

  return (
    <div className={`Media_msg ${el.incoming ? "start" : "end"}`}>
      {openMoreOptions && (
        <div className={`Menu_options`}>
          <p className="option">Reply</p>
          <p className="option">Delete</p>
        </div>
      )}

      <IoIosArrowDown
        className={`Menu_btn ${openMoreOptions ? "stay" : "close"}`}
        onClick={handleMoreOptions}
      ></IoIosArrowDown>

      {chat_type !== "individual" && el.incoming && (
        <div className="user_profile">
          <img className="img" src={user?.avatar} alt="" />
        </div>
      )}

      <div
        className="Img_Container"
        onClick={() => {
          dispatch(setfullImagePreview({ fullviewImg: el }));
        }}
      >
        <img src={el.img} alt={el.message} style={{ userSelect: "none" }} />
        {el.status == "pending" && (
          <svg className="Img_loader" viewBox="20 24 60 70">
            <circle className="spin" r="20" cy="50" cx="50"></circle>
          </svg>
        )}
      </div>
      {el.message && <p className="msg">{el.message}</p>}
      <div className="time_Stamp">
        <p className="">{Time}</p>
        {!el.incoming ? (
          el.status == "pending" ? (
            <LuClock4 />
          ) : (
            <LiaCheckDoubleSolid />
          )
        ) : (
          ""
        )}
      </div>
    </div>
  );
};
const DocMsg = ({ el }) => {
  const [openMoreOptions, setOpenMoreOptions] = useState(false);
  const handleMoreOptions = () => {
    setOpenMoreOptions((prev) => !prev);
  };
  return (
    <div className={`Doc_msg ${el.incoming ? "start" : "end"}  `}>
      {openMoreOptions && (
        <div className={`Menu_options`}>
          <p className="option">Reply</p>
          <p className="option">Delete</p>
        </div>
      )}
      <IoIosArrowDown
        className={`Menu_btn ${openMoreOptions ? "stay" : "close"}`}
        onClick={handleMoreOptions}
      ></IoIosArrowDown>

      <CiImageOn />
      <p>Abstract.png</p>
      <HiDownload />
    </div>
  );
};
const LinkMsg = ({ el }) => {
  const [openMoreOptions, setOpenMoreOptions] = useState(false);
  const handleMoreOptions = () => {
    setOpenMoreOptions((prev) => !prev);
  };
  return (
    <div className={`Link_msg ${el.incoming ? "start" : "end"}  `}>
      {openMoreOptions && (
        <div className={`Menu_options`}>
          <p className="option">Reply</p>
          <p className="option">Delete</p>
        </div>
      )}
      <IoIosArrowDown
        className={`Menu_btn ${openMoreOptions ? "stay" : "close"}`}
        onClick={handleMoreOptions}
      ></IoIosArrowDown>

      <img src={el.preview} alt={el.message} />
      <a href={el.preview} className="msg">
        {el.preview}
      </a>
    </div>
  );
};
const Timeline = ({ date }) => {
  const formatTime = formatTime2(date);

  return (
    <div className="Timeline_msg">
      <p className="text">{formatTime}</p>
    </div>
  );
};
const ReplyMsg = ({ el }) => {};

export { TextMsg, MediaMsg, DocMsg, LinkMsg, ReplyMsg, Timeline };
