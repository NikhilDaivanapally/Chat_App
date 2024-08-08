import React, { useEffect, useMemo, useRef, useState } from "react";
import "./auth.css";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useOtpsubmitMutation,
  useSignupMutation,
} from "../store/slices/apiSlice";
import ToastConfig from "../toastConfig/ToastConfig";
import { useDispatch } from "react-redux";
import { UpdateAuthState } from "../store/slices/authSlice";
const Signup = () => {
  const dispatch = useDispatch();
  const Navigate = useNavigate();
  const length = 6;
  const [showpassword, setShowpassword] = useState({
    password: false,
    confirmPassword: false,
  });
  const [signupFormData, setsignupFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    about: "",
    gender: "",
    avatar: null,
  });
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);
  const [
    signup,
    {
      isLoading: signupisLoading,
      isError: signupisError,
      isSuccess: signupisSuccess,
      error: signuperror,
      data: signupdata,
    },
  ] = useSignupMutation();

  const [
    otpsubmit,
    {
      isLoading: otpsubmitisLoading,
      isError: otpsubmitisError,
      isSuccess: otpsubmitisSuccess,
      error: otpsubmiterror,
      data: otpsubmitdata,
    },
  ] = useOtpsubmitMutation();

  useEffect(() => {
    // any error while making an api call
    signupisError && toast.error(signuperror.data?.message);
    signupisSuccess && toast.success(signupdata.message);
  }, [signupisError, signupisSuccess]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    // any error while making an api call
    otpsubmitisError && toast.error(otpsubmiterror.data.message);

    otpsubmitisSuccess && dispatch(UpdateAuthState(otpsubmitdata.user));
    otpsubmitisSuccess &&
      localStorage.setItem("auth_id", JSON.stringify(otpsubmitdata.user));
    otpsubmitisSuccess && toast.success(otpsubmitdata.message);
    otpsubmitisSuccess && Navigate("/");
  }, [otpsubmitisError, otpsubmitisSuccess]);

  // handling form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    let testCase = [
      signupFormData.userName,
      signupFormData.email,
      signupFormData.password,
      signupFormData.confirmPassword,
      signupFormData.gender,
    ].some((val) => val == "");

    if (!testCase) {
      const data = new FormData();
      for (let key in signupFormData) {
        data.append(key, signupFormData[key]);
      }

      await signup(data);

      // use unwrap() to get the result returned & console by assigning it to a variable
      // const res = await signup(data).unwrap();
      // console.log(res);
    } else {
      toast.error("Star marked fields are required !");
    }
  };

  // to preview the avatar uploaded by user by Generating the url
  const avatarUrl = useMemo(() => {
    if (signupFormData?.avatar) {
      return URL.createObjectURL(signupFormData.avatar);
    }
  }, [signupFormData?.avatar]);

  const handleInputChnage = (e) => {
    const { name, value } = e.target;
    setsignupFormData({ ...signupFormData, [name]: value });
    e.target.name !== "gender" && e.target.nextSibling.classList.add("lift");
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setsignupFormData({ ...signupFormData, [name]: files[0] });
  };

  // verifyOtp code
  const handleOtpChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    const newotp = [...otp];
    newotp[index] = value.substring(value.length - 1);
    setOtp(newotp);

    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      if (otp[index + 1]) {
        inputRefs.current[otp.indexOf("")].focus();
      } else {
        inputRefs.current[index + 1].focus();
      }
    }
  };
  const handlekeydown = (index, e) => {
    if (
      e.key == "Backspace" &&
      !otp[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1].focus();
    }
  };

  // otp verify
  const handleOtpsubmit = async (e) => {
    e.preventDefault();
    if (!otp.some((val) => val == "")) {
      await otpsubmit({
        email: signupFormData.email,
        otp: otp.join(""),
      });

      // use unwrap() to get the result returned & console by assigning it to a variable
      // const res = await otpsubmit({email: signupFormData.email,otp: otp.join("")).unwrap();
      // console.log(res);
    } else {
      toast.error("fields should not be empty");
    }
  };

  return (
    <div className="Signup verify">
      {/* Toaster */}
      <ToastConfig />
      {!signupisSuccess ? (
        <div className="Signup_Container">
          <p className="Signup_title">Sign Up</p>
          <form className="Signup_form" onSubmit={handleSubmit}>
            {/* file */}
            <div className="inpt_file">
              <label>Avatar</label>
              <div className="choose">
                <input
                  type="file"
                  id="select"
                  name="avatar"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {!signupFormData.avatar ? (
                  <label htmlFor="select" className="select">
                    Choose File
                  </label>
                ) : (
                  <label>{signupFormData.avatar.name}</label>
                )}
                {avatarUrl && (
                  <div className="previewer">
                    <img src={avatarUrl} alt="avatar" />
                  </div>
                )}
              </div>
            </div>
            {/* text */}
            <div className="inpt_tag">
              <input
                className="inpt"
                type="text"
                name="userName"
                autoComplete="name"
                onChange={handleInputChnage}
                onFocus={(e) => {
                  e.target.nextSibling.classList.add("lift");
                }}
                onBlur={(e) => {
                  !signupFormData.userName &&
                    e.target.nextSibling.classList.remove("lift");
                }}
              />
              <span className="input_name">UserName *</span>
            </div>
            <div className="inpt_tag">
              <input
                className="inpt"
                type="email"
                name="email"
                autoComplete="email"
                onChange={handleInputChnage}
                onFocus={(e) => {
                  e.target.nextSibling.classList.add("lift");
                }}
                onBlur={(e) => {
                  !signupFormData.email &&
                    e.target.nextSibling.classList.remove("lift");
                }}
              />
              <span className="input_name">Email *</span>
            </div>
            <div className="inpt_tag">
              <input
                className="inpt inptpass"
                type={showpassword.password ? "text" : "password"}
                name="password"
                onChange={handleInputChnage}
                onFocus={(e) => {
                  e.target.nextSibling.classList.add("lift");
                }}
                onBlur={(e) => {
                  !signupFormData.password &&
                    e.target.nextSibling.classList.remove("lift");
                }}
              />
              <span className="input_name">password *</span>
              <div
                className="showpassword_toggle"
                onClick={() =>
                  setShowpassword({
                    ...showpassword,
                    password: !showpassword.password,
                  })
                }
              >
                {showpassword.password ? (
                  <IoMdEyeOff className="showicon" />
                ) : (
                  <IoMdEye className="showicon" />
                )}
              </div>
            </div>
            <div className="inpt_tag">
              <input
                className="inpt inptpass"
                type={showpassword.confirmPassword ? "text" : "password"}
                name="confirmPassword"
                onChange={handleInputChnage}
                onFocus={(e) => {
                  e.target.nextSibling.classList.add("lift");
                }}
                onBlur={(e) => {
                  !signupFormData.confirmPassword &&
                    e.target.nextSibling.classList.remove("lift");
                }}
              />
              <span className="input_name">confirm password *</span>
              <div
                className="showpassword_toggle"
                onClick={() =>
                  setShowpassword({
                    ...showpassword,
                    confirmPassword: !showpassword.confirmPassword,
                  })
                }
              >
                {showpassword.confirmPassword ? (
                  <IoMdEyeOff className="showicon" />
                ) : (
                  <IoMdEye className="showicon" />
                )}
              </div>
            </div>
            <div className="inpt_tag">
              <textarea
                className="txt"
                type="text"
                name="about"
                onChange={handleInputChnage}
                onFocus={(e) => {
                  e.target.nextSibling.classList.add("lift");
                }}
                onBlur={(e) => {
                  !signupFormData.about &&
                    e.target.nextSibling.classList.remove("lift");
                }}
              />
              <span className="input_name">About</span>
            </div>
            {/* Gender Section */}
            <div className="Gender_container">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  onChange={handleInputChnage}
                />
                Male
              </label>{" "}
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  onChange={handleInputChnage}
                />
                Female
              </label>{" "}
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="others"
                  onChange={handleInputChnage}
                />
                others
              </label>
            </div>
            {/* submit button */}
            <button type="submit" className="Signup_btn">
              {signupisLoading ? (
                <svg className="loader" viewBox="20 24 60 70">
                  <circle className="spin" r="20" cy="50" cx="50"></circle>
                </svg>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
          <p className="redirect_login">
            Already have an account ?
            <Link to={"/login"} className="login">
              Log In
            </Link>
          </p>
        </div>
      ) : (
        <div className="verify_Container">
          <div className="verify_info">
            <p>we have sent a verification code to </p>
            <p>{signupFormData.email}</p>
          </div>
          <form className="otp_form" onSubmit={handleOtpsubmit}>
            <div className="otp_container">
              {otp.map((value, index) => {
                return (
                  <input
                    className="otp_box"
                    key={`inpt_${index}`}
                    ref={(input) => (inputRefs.current[index] = input)}
                    type="text"
                    value={value}
                    onChange={(e) => handleOtpChange(index, e)}
                    onKeyDown={(e) => handlekeydown(index, e)}
                  />
                );
              })}
            </div>
            <button className="Signup_btn">
              {otpsubmitisLoading ? (
                <svg className="loader" viewBox="20 24 60 70">
                  <circle className="spin" r="20" cy="50" cx="50"></circle>
                </svg>
              ) : (
                "verify otp"
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Signup;
