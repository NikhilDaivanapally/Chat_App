import React, { useEffect, useRef, useState } from "react";
import "./UpdatesDialog.css";
import { useDispatch, useSelector } from "react-redux";
import { Friend, User, FriendRequest } from "./DialogboxComp/UpdatesDialogComp";
import { RxCross2 } from "react-icons/rx";
import {
  useFriendrequestsQuery,
  useFriendsQuery,
  useUsersQuery,
} from "../../../store/slices/apiSlice";
import {
  updateFriendRequests,
  updateFriends,
  updateUsers,
} from "../../../store/slices/appSlice";
import Dialog from "../../Dialog/Dialog";

const UsersList = () => {
  const dispatch = useDispatch();
  //  fetching the users
  const {
    isLoading: isUsersLoading,
    data: UsersData,
    isSuccess: isUsersDataSuccess,
  } = useUsersQuery();
  // update Users
  useEffect(() => {
    if (isUsersDataSuccess && UsersData.data) {
      // update the store with users data
      dispatch(updateUsers(UsersData.data));
    }
  }, [isUsersDataSuccess]);

  const { users } = useSelector((state) => state.app);
  return (
    <div className="users_container">
      {!isUsersLoading ? (
        <>
          {users.length ? (
            users.map((user) => {
              return <User key={user._id} {...user} />;
            })
          ) : (
            <p className="no_users">No Users</p>
          )}
        </>
      ) : (
        <div className="loader_container">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};
const FriendsList = () => {
  const dispatch = useDispatch();
  //  fetching the friends
  const {
    isLoading: isFriendsListLoading,
    data: FriendsData,
    isSuccess: isFriendsSuccess,
  } = useFriendsQuery();
  // update FriendsList
  useEffect(() => {
    if (isFriendsSuccess && FriendsData && FriendsData.data) {
      //  Update the store with users data
      dispatch(updateFriends(FriendsData.data));
    }
  }, [isFriendsSuccess]);

  const { friends } = useSelector((state) => state.app);
  return (
    <div className="users_container">
      {!isFriendsListLoading ? (
        <>
          {friends?.length ? (
            friends.map((user) => {
              return <Friend key={user._id} {...user} />;
            })
          ) : (
            <p className="no_friends">No Friends</p>
          )}
        </>
      ) : (
        <div className="loader_container">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};
const RequestList = () => {
  const dispatch = useDispatch();

  //  fetching the friendsRequests
  const {
    isLoading: isFriendReqsLoading,
    data: FriendRequestData,
    isSuccess: isFriendRequestSuccess,
  } = useFriendrequestsQuery();

  // update FriendRequests
  useEffect(() => {
    if (isFriendRequestSuccess && FriendRequestData.data) {
      // update the store with friendRequests data
      dispatch(updateFriendRequests(FriendRequestData.data));
    }
  }, [isFriendRequestSuccess]);

  const { friendRequests } = useSelector((state) => state.app);
  return (
    <div className="users_container">
      {!isFriendReqsLoading ? (
        <>
          {friendRequests.length ? (
            friendRequests.map((user) => {
              return <FriendRequest key={user._id} {...user} />;
            })
          ) : (
            <p className="no_friend_req">No friend request</p>
          )}
        </>
      ) : (
        <div className="loader_container">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};
const UpdatesDialog = ({ openDialog, handlecloseDialog }) => {
  const array = ["Friend Requests", "Friends", "All Users"];
  const [activeField, setactiveField] = useState(array[0]);
  const liRefs = useRef([]);
  const barRef = useRef(null);
  const Content_BoxRef = useRef(null);
  const Handlelianim = (e, index) => {
    setactiveField(e.target.innerText);

    let lengthbar = e.target.getBoundingClientRect().width;
    barRef.current.style.width = lengthbar + "px";
    const ContentBoxVal = Content_BoxRef.current.getBoundingClientRect();

    const left = e.target.getBoundingClientRect().x - ContentBoxVal.x;
    const top = e.target.getBoundingClientRect().y - ContentBoxVal.y;

    barRef.current.style.left = `${left}px`;
    barRef.current.style.top = `${top + 26}px`;
  };

  useEffect(() => {
    if (Content_BoxRef.current && barRef.current && liRefs.current.length) {
      const ContentBoxVal = Content_BoxRef.current.getBoundingClientRect();

      const getDimensions = liRefs.current[0].getBoundingClientRect();
      const initialwidth = getDimensions.width;
      const top = getDimensions.y - ContentBoxVal.y;
      const left = getDimensions.x - ContentBoxVal.x;
      barRef.current.style.width = `${initialwidth}px`;
      barRef.current.style.top = `${top + 26}px`;
      barRef.current.style.left = `${left}px`;
      barRef.current.style.display = "block";
    }
  }, []);

  return (
    <Dialog onClose={handlecloseDialog}>
      <div className="Dialog_box_content" ref={Content_BoxRef}>
        <RxCross2 className="close_Dialog" onClick={handlecloseDialog} />
        <ul className="content_tabs">
          <div ref={barRef} className="bar"></div>

          {array.map((elem, index) => {
            return (
              <li
                key={index}
                ref={(elem) => (liRefs.current[index] = elem)}
                onClick={(e) => {
                  Handlelianim(e, index);
                }}
              >
                {elem}
              </li>
            );
          })}
        </ul>
        <div className="content">
          {(() => {
            switch (activeField) {
              case "Friend Requests":
                return <RequestList />;
              case "Friends":
                return <FriendsList />;
              case "All Users":
                return <UsersList />;

              default:
                break;
            }
          })()}
        </div>
      </div>
    </Dialog>
  );
};

export default UpdatesDialog;
