import React, { useEffect, useRef } from "react";
import { MdKeyboardArrowLeft } from "react-icons/md";
import "./SettingComp.css";
import { useNavigate } from "react-router-dom";
const SettingsComp = () => {
  const Navigate = useNavigate();
  const inputRef = useRef(null);

  const settingList = ["Change Theme"];

  const handleChangeTheme = () => {
    let bodyTheme = document.body.getAttribute("data-theme");
    bodyTheme == "light"
      ? document.body.setAttribute("data-theme", "dark")
      : document.body.setAttribute("data-theme", "light");
    const theme = bodyTheme == "light" ? "dark" : "light";
    localStorage.setItem("data-theme", theme);
  };
  const handleSelect = (e) => {
    switch (e.target.tagName) {
      case "INPUT":
        switch (true) {
          case e.target.classList.contains("Change_Theme"):
            handleChangeTheme();
            break;

          default:
            break;
        }
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      const theme = localStorage.getItem("data-theme");
      switch (theme) {
        case "light":
          inputRef.current.checked = false;

          break;
        case "dark":
          inputRef.current.checked = true;
          break;
      }
    }
  }, []);
  const handleBack = () => {
    Navigate(-1);
  };
  return (
    <div className="Settings_Sections">
      <div className="Top_Section">
        <div className="Top_bar">
          <MdKeyboardArrowLeft onClick={handleBack} />
          <p className="left title">Settings</p>
        </div>
      </div>

      <div className="settings" onClick={handleSelect}>
        {settingList?.map((opt) => {
          return (
            <div className="Setting_option " key={`${opt}_v1`}>
              <p className="">{opt}</p>
              <label className="switch-container">
                <input
                  type="checkbox"
                  ref={inputRef}
                  className={"Change_Theme"}
                />
                <span className="slider"></span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsComp;
