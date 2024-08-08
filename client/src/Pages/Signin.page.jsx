import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import toast from "react-hot-toast";
import { useLoginMutation } from "../store/slices/apiSlice";
import { useEffect } from "react";
import "./auth.css";
import ToastConfig from "../toastConfig/ToastConfig";
import { UpdateAuthState, getAuthState } from "../store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
const Signin = () => {
  const dispatch = useDispatch();
  const user = useSelector(getAuthState);
  const Navigate = useNavigate();
  // console.log(user);
  const [signinFormData, setsigninFormData] = useState({
    email: "",
    password: "",
  });
  const [showpassword, setShowpassword] = useState(false);
  const [
    login,
    {
      isLoading: loginisLoading,
      isError: loginisError,
      isSuccess: loginisSuccess,
      error: loginerror,
      data: logindata,
    },
  ] = useLoginMutation();

  useEffect(() => {
    loginisSuccess &&
      localStorage.setItem("auth_id", JSON.stringify(logindata.user));
    loginisSuccess && dispatch(UpdateAuthState(logindata.user));
    loginisSuccess && toast.success(logindata.message);
    logindata && Navigate("/");
    loginisError && toast.error(loginerror?.data?.message || loginerror.error);
  }, [loginisSuccess, loginisError]);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Object.values(signinFormData).some((val) => val == "")) {
      await login(signinFormData);
    } else {
      toast.error("All Fields are Required");
    }
  };
  const handleInputChnage = (e) => {
    const { name, value } = e.target;
    setsigninFormData({ ...signinFormData, [name]: value });
  };
  return (
    <div className="Signin">
      {/* Toaster */}
      <ToastConfig />
      <div className="Signin_Container">
        <p className="Signin_title">Log In</p>
        <form className="Signin_form" onSubmit={handleSubmit}>
          {/* text */}

          <div className="inpt_tag">
            <input
              className="inpt"
              type="text"
              name="email"
              autoComplete="email"
              onChange={handleInputChnage}
              onFocus={(e) => {
                e.target.nextSibling.classList.add("lift");
              }}
              onBlur={(e) => {
                !signinFormData.email &&
                  e.target.nextSibling.classList.remove("lift");
              }}
            />
            <span className="input_name">Email *</span>
          </div>
          <div className="inpt_tag">
            <input
              className="inpt inptpass"
              type={showpassword ? "text" : "password"}
              name="password"
              onChange={handleInputChnage}
              onFocus={(e) => {
                e.target.nextSibling.classList.add("lift");
              }}
              onBlur={(e) => {
                !signinFormData.password &&
                  e.target.nextSibling.classList.remove("lift");
              }}
            />
            <span className="input_name">password *</span>
            <div
              className="showpassword_toggle"
              onClick={() => setShowpassword(!showpassword)}
            >
              {showpassword ? (
                <IoMdEyeOff className="showicon" />
              ) : (
                <IoMdEye className="showicon" />
              )}
            </div>
          </div>
          <Link to={"/forgot-password"} className="forgot_password">
            Forgot password
          </Link>
          {/* submit button */}
          <button type="submit" className="Signin_btn">
            {loginisLoading ? (
              <svg className="loader" viewBox="20 24 60 70">
                <circle className="spin" r="20" cy="50" cx="50"></circle>
              </svg>
            ) : (
              "Log In"
            )}
          </button>
        </form>
        <p className="redirect_login">
          Don't have an account ?
          <Link to={"/signup"} className="signup">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signin;
