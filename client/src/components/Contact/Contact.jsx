import React from "react";
import "./Contact.css";
import { useDispatch, useSelector } from "react-redux";
import { RxCross2 } from "react-icons/rx";
import { MdKeyboardArrowRight } from "react-icons/md";
import { toggleSideBar, updateSidebarType } from "../../store/slices/appSlice";
import { setfullImagePreview } from "../../store/slices/conversation";
const Contact = () => {
  const auth = JSON.parse(localStorage.getItem("auth_id"));
  const dispatch = useDispatch();
  const handlecloseSideBar = () => {
    dispatch(toggleSideBar());
  };
  const handleChangeSidebar = () => {
    dispatch(updateSidebarType({ type: "SHARED" }));
  };
  const { sideBar } = useSelector((state) => state.app);
  const { current_direct_conversation, current_direct_messages } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const { room_id, chat_type } = useSelector((state) => state.app);
  const { current_group_conversation } = useSelector(
    (state) => state.conversation.group_chat
  );
  const { friends } = useSelector((state) => state.app);
  const admin = [...friends, auth].find(
    //problem
    (el) => el?._id == current_group_conversation?.admin
  );
  const users = current_group_conversation?.users
    ? [...current_group_conversation?.users, admin]
    : [];
  const AllMediaImgs = current_direct_messages
    ?.filter((el) => el.subtype == "Media")
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  const MediaImgs = AllMediaImgs.slice(0, 3);
  return (
    <div className={`Contact_Container ${sideBar.open && "open"}`}>
      <div className="Close_Sidebar_Conatiner">
        <RxCross2 className="Close_Sidebar" onClick={handlecloseSideBar} />
        <span>Contact Info</span>
      </div>
      <div className="Contact_info">
        <div className="Contact_details">
          <div className="profile_name">
            <img
              className="profile_img"
              src={
                chat_type == "individual"
                  ? current_direct_conversation?.avatar
                  : current_group_conversation?.img
              }
              alt="img"
            />

            <span>
              {chat_type == "individual"
                ? current_direct_conversation?.name
                : current_group_conversation?.title}
            </span>
          </div>
        </div>
        <div className="about">
          <p className="title">
            {chat_type == "individual" ? "About" : "About group Desciption"}
          </p>
          <span className="msg">{current_direct_conversation?.about}</span>
        </div>
        <div className="Media">
          <div className="top_section">
            <p className="left_part">Media, links and docs</p>
            <div className="right_part" onClick={handleChangeSidebar}>
              <p className="Media_count">{AllMediaImgs.length}</p>
              <MdKeyboardArrowRight className="view_Media" />
            </div>
          </div>
          <div className="bottom_section">
            {MediaImgs.map((el, i) => (
              <img
                key={`img_${i}`}
                src={el.img}
                alt=""
                onClick={() =>
                  dispatch(setfullImagePreview({ fullviewImg: el }))
                }
              />
            ))}
          </div>
        </div>
        {chat_type == "group" && (
          <div className="members_in_group">
            <p>{users?.length} members</p>
            <ul className="member_Cont">
              {users?.length > 0 &&
                users?.map((user, i) => {
                  return (
                    <li key={`asdlfaks_${i}`} className="member">
                      <div className="img_Cont">
                        <img src={user?.avatar} alt="" />
                      </div>
                      <div className="member_info">
                        <p className="member_name">
                          {user?._id !== auth?._id ? user?.userName : "you"}{" "}
                          {user?._id == current_group_conversation?.admin && (
                            <span className="admin">Group Admin</span>
                          )}
                        </p>
                        <p className="member_about">{user?.about}</p>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contact;
