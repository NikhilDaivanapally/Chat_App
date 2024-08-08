import React, { useEffect, useState } from "react";
import "./auth.css";
import ToastConfig from "../toastConfig/ToastConfig";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useResetpassMutation } from "../store/slices/apiSlice";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const [resetFormData, setResetFormData] = useState({
    NewPassword: "",
    confirmNewPassword: "",
  });
  const [showpassword, setShowpassword] = useState({
    NewPassword: false,
    confirmNewPassword: false,
  });
  const [
    resetpass,
    {
      isLoading: resetpassisLoading,
      isError: resetpassisError,
      isSuccess: resetpassisSuccess,
      error: resetpasserror,
      data: resetpassdata,
    },
  ] = useResetpassMutation();

  const handleInputChnage = (e) => {
    const { name, value } = e.target;
    setResetFormData({ ...resetFormData, [name]: value });
  };

  useEffect(() => {
    // console.log(resetpassdata)
    // console.log(resetpasserror)
    // resetpassisSuccess && toast.success(resetpassdata.message);
    // resetpassisError && toast.error(resetpasserror.data.message);
  }, [resetpassisSuccess, resetpassisError]);

  const handleSubmit = async (e) => {
    console.log(resetFormData);
    e.preventDefault();
    if (!Object.values(resetFormData).some((val) => val == "")) {
      await resetpass(resetFormData);
    } else {
      toast.error("All Fields are Required");
    }
  };
  return (
    <div className="resetPassword">
      {/* Toaster */}
      <ToastConfig />
      <div className="resetPassword_Container">
        <p className="resetPassword_title">Reset password</p>
        {!resetpassisSuccess ? (
          <>
            <p className="info">Set your New Password below</p>
            <form onSubmit={handleSubmit} className="resetPassword_form">
              <div className="inpt_tag">
                <input
                  className="inpt inptpass"
                  type={showpassword.NewPassword ? "text" : "password"}
                  name="NewPassword"
                  onChange={handleInputChnage}
                  onFocus={(e) => {
                    e.target.nextSibling.classList.add("lift");
                  }}
                  onBlur={(e) => {
                    !resetFormData.NewPassword &&
                      e.target.nextSibling.classList.remove("lift");
                  }}
                />
                <span className="input_name">New password *</span>
                <div
                  className="showpassword_toggle"
                  onClick={() =>
                    setShowpassword({
                      ...showpassword,
                      NewPassword: !showpassword.NewPassword,
                    })
                  }
                >
                  {showpassword.NewPassword ? (
                    <IoMdEyeOff className="showicon" />
                  ) : (
                    <IoMdEye className="showicon" />
                  )}
                </div>
              </div>
              <div className="inpt_tag">
                <input
                  className="inpt inptpass"
                  type={showpassword.confirmNewPassword ? "text" : "password"}
                  name="confirmNewPassword"
                  onChange={handleInputChnage}
                  onFocus={(e) => {
                    e.target.nextSibling.classList.add("lift");
                  }}
                  onBlur={(e) => {
                    !resetFormData.confirmNewPassword &&
                      e.target.nextSibling.classList.remove("lift");
                  }}
                />
                <span className="input_name">confirm New Password *</span>
                <div
                  className="showpassword_toggle"
                  onClick={() =>
                    setShowpassword({
                      ...showpassword,
                      confirmNewPassword: !showpassword.confirmNewPassword,
                    })
                  }
                >
                  {showpassword.confirmNewPassword ? (
                    <IoMdEyeOff className="showicon" />
                  ) : (
                    <IoMdEye className="showicon" />
                  )}
                </div>
              </div>
              <button type="submit" className="resetPassword_btn">
                {resetpassisLoading ? (
                  <svg className="loader" viewBox="20 24 60 70">
                    <circle className="spin" r="20" cy="50" cx="50"></circle>
                  </svg>
                ) : (
                  "Reset password"
                )}
              </button>
            </form>
          </>
        ) : (
          <p className="info">
            password reset successfull <br />{" "}
            <Link to={"/login"}>Back to Login</Link>
          </p>
        )}
      </div>
    </div>
  );
};
export default ResetPassword;
