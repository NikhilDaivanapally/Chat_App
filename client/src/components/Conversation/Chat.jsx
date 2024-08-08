import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DocMsg,
  LinkMsg,
  MediaMsg,
  ReplyMsg,
  TextMsg,
  Timeline,
} from "./Msgtype";
import { socket } from "../../socket";
import {
  addDirectMessage,
  addGroupMessage,
  fetchCurrentDirectMessages,
  fetchCurrentGroupMessages,
  setCurrentDirectConversation,
  setCurrentGroupConversation,
  setfullImagePreview,
} from "../../store/slices/conversation";
import NoChat from "./NoChat/NoChat";
import Header from "./Header";
import Footer from "./Footer";
import "./Chat.css";
import { BsEmojiSmile } from "react-icons/bs";
import { RxCross2 } from "react-icons/rx";
import { LuSendHorizonal } from "react-icons/lu";
import { LuPlus } from "react-icons/lu";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import SortMessages from "../../utils/SortMessages";
const Chat = () => {
  const dispatch = useDispatch();
  const [isloading, setIsloading] = useState(false);
  const [isNonTextmsg, setIsNonTextmsg] = useState(null);
  const [previewURLs, setPreviewURLs] = useState(null);
  const [mainPreview, setMainprev] = useState(null);
  const [textmsg, setTextmsg] = useState("");
  const messagesListRef = useRef(null);
  const { room_id, chat_type } = useSelector((state) => state.app);
  const { fullImagePreview } = useSelector((state) => state.conversation);
  const {
    DirectConversations,
    current_direct_messages,
    current_direct_conversation,
  } = useSelector((state) => state.conversation.direct_chat);
  const {
    GroupConversations,
    current_group_messages,
    current_group_conversation,
  } = useSelector((state) => state.conversation.group_chat);

  const {
    _id: auth_id,
    userName,
    avatar,
  } = JSON.parse(localStorage.getItem("auth_id"));
  const userList = current_group_conversation?.users.map((el) => {
    return el._id;
  });
  const MediaImgs = current_direct_messages?.filter(
    (el) => el.subtype == "Media"
  );
  // Scroll to the bottom when messages change
  const scrollToBottom = () => {
    if (messagesListRef.current) {
      messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight;
    }
  };
  useEffect(() => {
    // Using setTimeout to ensure scroll happens after DOM update
    setTimeout(scrollToBottom, 100);
  }, [current_direct_messages, current_group_messages, room_id, isNonTextmsg]);

  // get the messages for current room_id and set it has current_direct_conversation
  useEffect(() => {
    switch (true) {
      case room_id !== null:
        switch (chat_type) {
          case "individual":
            setIsloading(true);
            const currentDirectChat = DirectConversations.find(
              (el) => el?.id === room_id
            );
            if (currentDirectChat) {
              socket.emit(
                "get_messages",
                { conversation_id: currentDirectChat?.id },
                (data) => {
                  dispatch(fetchCurrentDirectMessages(data));
                  setIsloading(false);
                }
              );
              dispatch(setCurrentDirectConversation(currentDirectChat));
            } else {
              setIsloading(false);
            }
            break;
          case "group":
            setIsloading(true);
            const currentGroupChat = GroupConversations.find(
              (el) => el?.id === room_id
            );
            socket.emit(
              "get_messages",
              { conversation_id: currentGroupChat?.id },
              (data) => {
                dispatch(fetchCurrentGroupMessages(data));
                setIsloading(false);
              }
            );
            dispatch(setCurrentGroupConversation(currentGroupChat));
            break;
          default:
            console.log("Invalid Chat_type");
            break;
        }
        break;

      default:
        // console.log("room_id is undefined || null");
        break;
    }
  }, [room_id]);
  useEffect(() => {
    if (isNonTextmsg) {
      const PreviewURL = isNonTextmsg.map((media) => {
        const reader = new FileReader(); // Create a new FileReader instance for each media file
        reader.readAsDataURL(media);

        return new Promise((resolve) => {
          reader.onload = (e) => {
            const blob = e.target.result;
            resolve({
              name: media.name,
              size: media.size,
              url: URL.createObjectURL(media),
              blob,
            });
          };
        });
      });

      // Wait for all promises to resolve
      Promise.all(PreviewURL).then((previewURLs) => {
        setPreviewURLs(previewURLs);
        setMainprev(previewURLs.slice(-1)[0]);

        return () => {
          // Later, when the URLs are no longer needed, revoke them
          previewURLs.forEach((preview) => URL.revokeObjectURL(preview.url));
        };
      });
    }
  }, [isNonTextmsg]);

  const handleClosesendMedia = () => {
    setIsNonTextmsg(null);
    setPreviewURLs(null);
  };

  const handleSendMediaMsg = () => {
    chat_type === "individual"
      ? dispatch(
          addDirectMessage({
            id: "",
            type: "msg",
            subtype: "Media",
            message: textmsg,
            img: previewURLs?.slice(-1)[0].url,
            created_at: new Date().toISOString(),
            incoming: false,
            outgoing: true,
            status: "pending",
          })
        )
      : dispatch(
          addGroupMessage({
            id: "",
            type: "msg",
            subtype: "Media",
            message: textmsg,
            img: previewURLs?.slice(-1)[0].url,
            created_at: new Date().toISOString(),
            incoming: false,
            outgoing: true,
            status: "pending",
          })
        );

    const to =
      chat_type === "individual"
        ? [current_direct_conversation.user_id]
        : userList;

    console.log({
      conversation_id: room_id,
      message: {
        file: previewURLs,
        text: textmsg,
      },
      from: auth_id,
      to,
      type: "Media",
      chat_type,
    });
    socket.emit("media_message", {
      conversation_id: room_id,
      message: {
        file: previewURLs,
        text: textmsg,
      },
      from: auth_id,
      to,
      type: "Media",
      chat_type,
    });
    setIsNonTextmsg(null);
    setPreviewURLs(null);
    setTextmsg(null);
  };
  const Current_index = MediaImgs.findIndex(
    (el) => el?.id == fullImagePreview?.id
  );
  const handleChangeImage = (e) => {
    console.log(e);
    switch (true) {
      case e.target.classList.contains("prev") ||
        e.target.parentElement.classList.contains("prev"):
        Current_index > 0 &&
          dispatch(
            setfullImagePreview({ fullviewImg: MediaImgs[Current_index - 1] })
          );
        break;
      case e.target.classList.contains("next") ||
        e.target.parentElement.classList.contains("next"):
        Current_index < MediaImgs.length - 1 &&
          dispatch(
            setfullImagePreview({ fullviewImg: MediaImgs[Current_index + 1] })
          );
        break;
      default:
        break;
    }
  };

  let DatesArray;
  let MessagesObject;

  const {
    DatesArray: IndividualMessagesSortedDates,
    MessagesObject: IndividualMessagesObject,
  } = SortMessages({
    messages: current_direct_messages,
    sort: "Asc",
  });

  const {
    DatesArray: GroupMessagesSortedDates,
    MessagesObject: GroupMessagesObject,
  } = SortMessages({
    messages: current_group_messages,
    sort: "Asc",
  });

  return (
    <div
      className={`Conversation_diplay ${
        current_direct_conversation || current_group_conversation
          ? ""
          : "disableChat_display"
      }`}
    >
      {room_id !== null ? (
        <>
          {!isloading ? (
            <div className="Selected_Conversation">
              {/* header */}
              <Header />
              {!isNonTextmsg && !previewURLs ? (
                <>
                  <div className="body" ref={messagesListRef}>
                    {chat_type === "individual" ? (
                      <>
                        {IndividualMessagesSortedDates.map((date, i) => (
                          <div key={`${date}_Msgs`} className="datewise_msgs">
                            {/* Date */}
                            <Timeline date={date} />
                            {/* messages */}
                            {IndividualMessagesObject[date].map((el, index) => {
                              switch (el.type) {
                                case "msg":
                                  switch (el.subtype) {
                                    case "Media":
                                      return <MediaMsg el={el} key={index} />;
                                    case "doc":
                                      return <DocMsg el={el} key={index} />;
                                    case "link":
                                      return <LinkMsg el={el} key={index} />;
                                    case "reply":
                                      return <ReplyMsg el={el} key={index} />;
                                    default:
                                      return <TextMsg el={el} key={index} />;
                                  }
                                default:
                                  return null;
                              }
                            })}
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        {GroupMessagesSortedDates.map((date, i) => (
                          <div key={`${date}_Msgs`} className="datewise_msgs">
                            {/* Date */}
                            <Timeline date={date} />
                            {/* messages */}
                            {GroupMessagesObject[date].map((el, index) => {
                              switch (el.type) {
                                case "msg":
                                  switch (el.subtype) {
                                    case "Media":
                                      return <MediaMsg el={el} key={index} />;
                                    case "doc":
                                      return <DocMsg el={el} key={index} />;
                                    case "link":
                                      return <LinkMsg el={el} key={index} />;
                                    case "reply":
                                      return <ReplyMsg el={el} key={index} />;
                                    default:
                                      return <TextMsg el={el} key={index} />;
                                  }
                                default:
                                  return null;
                              }
                            })}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  {fullImagePreview && (
                    <div className="Imagefull_viewPage">
                      <div className="viewPage_header">
                        <div className="Profile" onClick={() => {}}>
                          <div className="profile_container">
                            <img
                              className="profile"
                              src={
                                chat_type === "individual"
                                  ? fullImagePreview?.outgoing
                                    ? avatar
                                    : current_direct_conversation?.avatar
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
                                ? fullImagePreview?.outgoing
                                  ? "you"
                                  : current_direct_conversation?.name
                                : fullImagePreview?.outgoing
                                ? "you"
                                : current_group_conversation?.title}
                            </p>
                            <p className="profile_status">
                              {new Date(
                                fullImagePreview?.created_at
                              ).toLocaleDateString()}{" "}
                              at{" "}
                              {new Date(
                                fullImagePreview?.created_at
                              ).toLocaleString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true, // Use 12-hour clock and show AM/PM
                              })}
                            </p>
                          </div>
                        </div>
                        <div
                          className="close_Imagefull_viewPage"
                          onClick={() =>
                            dispatch(setfullImagePreview({ fullviewImg: null }))
                          }
                        >
                          <RxCross2 />
                        </div>
                      </div>
                      {/* <Header /> */}
                      <div className="fullImageView">
                        {/*Image carousel */}
                        <div className="carousel" onClick={handleChangeImage}>
                          <img src={fullImagePreview.img} alt="" />
                          {}{" "}
                          <IoIosArrowBack
                            className={`img_control dia prev ${
                              Current_index == 0 && "disable"
                            }`}
                          />
                          {}
                          <IoIosArrowForward
                            className={`img_control next ${
                              Current_index == MediaImgs.length - 1 && "disable"
                            }`}
                          />
                        </div>
                        {/* list imagesPreview */}
                        <div className="images_list_container">
                          <ul className="images_list">
                            {MediaImgs.map((el) => {
                              return (
                                <li
                                  className={`${
                                    fullImagePreview.id == el.id
                                      ? "selected"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    dispatch(
                                      setfullImagePreview({ fullviewImg: el })
                                    )
                                  }
                                >
                                  <img
                                    src={el.img}
                                    alt=""
                                    style={{ userSelect: "none" }}
                                  />
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* footer */}
                  <Footer
                    setIsNonTextmsg={setIsNonTextmsg}
                    isNonTextmsg={isNonTextmsg}
                  />
                </>
              ) : (
                <div className="body Preview_Send_Media">
                  <div className="Preview_Container">
                    <RxCross2
                      className="close_sendMedia"
                      onClick={handleClosesendMedia}
                    />
                    <img src={mainPreview?.url} alt="" />
                    <div className="preview_info">
                      <span>FileName : {mainPreview?.name}</span>
                      <span>
                        Size : {Math.round(mainPreview?.size / 1024)}
                        kb
                      </span>
                    </div>
                  </div>
                  <div className="Preview_Description">
                    <input
                      type="text"
                      value={textmsg}
                      placeholder="Add Description"
                      onChange={(e) => setTextmsg(e.target.value)}
                    />
                    <BsEmojiSmile className="emoji" />
                  </div>
                  <div className="send_media">
                    <ul className="selected_media">
                      {previewURLs?.map((media) => {
                        return (
                          <li onClick={() => setMainprev(media)}>
                            <img src={media.url} alt="" />
                          </li>
                        );
                      })}
                      <label className="Add_media">
                        <input
                          type="file"
                          hidden
                          onChange={(e) =>
                            setIsNonTextmsg([
                              ...isNonTextmsg,
                              ...Object.values(e.target.files),
                            ])
                          }
                        />
                        <LuPlus />
                      </label>
                    </ul>
                    <div className="btn" onClick={handleSendMediaMsg}>
                      <LuSendHorizonal />
                      {previewURLs?.length > 0 && (
                        <div className="count">{previewURLs?.length}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="loader_container">
              <div className="loader"></div>
            </div>
          )}
        </>
      ) : (
        <NoChat />
      )}
    </div>
  );
};

export default Chat;
