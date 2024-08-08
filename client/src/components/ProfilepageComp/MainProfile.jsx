import React, { useEffect, useState } from "react";
import "./MainProfile.css";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { getAuthState, UpdateAuthState } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { MdEdit } from "react-icons/md";
import { useUpdateuserMutation } from "../../store/slices/apiSlice";
import toast from "react-hot-toast";
import ToastConfig from "../../toastConfig/ToastConfig";
const MainProfile = () => {
  const auth = useSelector(getAuthState);
  const Navigate = useNavigate();
  const dispatch = useDispatch();
  const [updateuserData, setUpdateuserData] = useState({
    avatar: null,
    userName: "",
    email: "",
    about: "",
  });
  let updateavatarurl;
  if (updateuserData.avatar) {
    updateavatarurl = URL.createObjectURL(updateuserData.avatar);
  }
  const [updateuser, { isLoading, isSuccess, error, data }] =
    useUpdateuserMutation();

  const handleNavigateToPreviewPage = () => {
    Navigate(-1);
  };
  const handleInputChnage = (e) => {
    const { name, value } = e.target;
    setUpdateuserData({ ...updateuserData, [name]: value });
  };
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setUpdateuserData({ ...updateuserData, [name]: files[0] });
  };

  const handleSubmitupdateuserData = async () => {
    let testCase = Object.values(updateuserData).filter((val) => val);
    console.log(testCase);
    if (testCase.length > 0) {
      console.log("test case pass");
      const data = new FormData();
      for (let key in updateuserData) {
        if (updateuserData[key]) {
          data.append(key, updateuserData[key]);
          await updateuser(data);
          setUpdateuserData({
            avatar: null,
            userName: "",
            email: "",
            about: "",
          });
          toast.success("User updated successfully");
        }
      }
    } else {
      toast.error("Any one of the field is required to update");
    }
  };

  useEffect(() => {
    if (isSuccess && data.data) {
      localStorage.setItem("auth_id", JSON.stringify(data.data));
      dispatch(UpdateAuthState(data.data));
    }
  }, [isSuccess]);

  return (
    <div className="Profile_Container">
      <ToastConfig />
      <div className="profile_topSection">
        <MdKeyboardArrowLeft
          className="close_profile"
          onClick={handleNavigateToPreviewPage}
        />
        <p>Update Profile</p>
      </div>
      <div className="profile_bottomSection">
        <div className="edit_Profile">
          <div className="avatar_edit">
            {!updateavatarurl ? (
              <img src={auth.avatar} alt="" />
            ) : (
              <img src={updateavatarurl} alt="" />
            )}
            <input
              type="file"
              name="avatar"
              id="file"
              hidden
              onChange={handleFileChange}
            />
            <label htmlFor="file">
              <MdEdit className="edit" />
            </label>
          </div>
          <div className="update_field">
            <input
              className="inpt"
              type="text"
              name="userName"
              autoComplete="name"
              placeholder={auth.userName}
              value={updateuserData.userName}
              onChange={handleInputChnage}
            />
            <span className="input_name">UserName</span>
          </div>
          <div className="update_field">
            <input
              className="inpt"
              type="email"
              name="email"
              placeholder={auth.email}
              value={updateuserData.email}
              autoComplete="email"
              onChange={handleInputChnage}
            />
            <span className="input_name">Email </span>
          </div>
          <div className="update_field">
            <textarea
              className="txt"
              type="text"
              name="about"
              placeholder={auth.about}
              value={updateuserData.about}
              onChange={handleInputChnage}
            />
            <span className="input_name">About</span>
          </div>
          <button
            className="update_profileBtn"
            onClick={handleSubmitupdateuserData}
          >
            {isLoading ? (
              <svg className="loader" viewBox="20 24 60 70">
                <circle className="spin" r="20" cy="50" cx="50"></circle>
              </svg>
            ) : (
              "Update"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainProfile;
