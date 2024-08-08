import React, { useEffect, useState } from "react";
import { useForgotpassMutation } from "../store/slices/apiSlice";
import toast from "react-hot-toast";

import "./auth.css";
import ToastConfig from "../toastConfig/ToastConfig";
const Forgotpassowrd = () => {
  const [email, setEmail] = useState("");
  const [forgotpass, { isLoading, isError, isSuccess, error, data }] =
    useForgotpassMutation();
  useEffect(() => {
    isSuccess && toast.success(data.message);
    isError && toast.error(error.data.message);
  }, [isError, isSuccess]);

  const handlesubmit = async (e) => {
    e.preventDefault();
    if (email) {
      await forgotpass({ email });
    }
  };
  return (
    <div className="forgotpassword">
      {/* Toaster */}
      <ToastConfig />
      <div className="forgotpassword_Container">
        <p className="forgotpassword_title">Forgot password</p>
        {!isSuccess ? (
          <>
            <p className="info">We'll email you a password reset link.</p>
            <form onSubmit={handlesubmit} className="forgotpassword_form">
              <div className="inpt_tag">
                <input
                  className="inpt"
                  type="text"
                  name="email"
                  autoComplete="email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={(e) => {
                    e.target.nextSibling.classList.add("lift");
                  }}
                  onBlur={(e) => {
                    !email && e.target.nextSibling.classList.remove("lift");
                  }}
                />
                <span className="input_name">Email *</span>
              </div>
              <button type="submit" className="forgotpassword_btn">
                {isLoading ? (
                  <svg className="loader" viewBox="20 24 60 70">
                    <circle className="spin" r="20" cy="50" cx="50"></circle>
                  </svg>
                ) : (
                  "send password reset link"
                )}
              </button>
            </form>
          </>
        ) : (
          <p className="info">
            password reset link has been sent to <br /> <b>{email}</b>
          </p>
        )}
      </div>
    </div>
  );
};

export default Forgotpassowrd;
