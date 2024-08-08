# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

try {
// const response = await axios.post(
// "http://localhost:8000/v1/auth/register",
// data,
// {
// headers: {
// "Content-Type": "multipart/form-data",
// },
// }
// );
await signup(data).unwrap();
// console.log(response);
// if (response.data.status == "success") {
// setShowOtp(true);
// toast.success(response.data.message);
// }
} catch (error) {
// console.log(error)
// console.log(error.response.data.message);
// toast.error(error.response.data.message);
}

          // const combineotp = newotp.join("");

    // if (combineotp.length == length) {
    //   console.log(combineotp);
    // }



.chat_display {
  /* flex: 1; */
  background-color: black;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.chat_display .chat_info_container {
  width: 100%;
  padding: 1rem 4.5rem;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.left_paart {
  display: flex;
  gap: 20px;
}
.profile_chat-menu {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}
.profile_chat-menu .avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile_chat_info {
  line-height: 1;
}
.profile_chat_info p:nth-child(1) {
  font-size: 1.2rem;
  font-weight: 500;
}
.profile_chat_info p:nth-child(2) {
  margin-top: 0.3rem;
  font-size: 0.85rem;
}

.media_controls ul {
  display: flex;
  gap: 3rem;
  list-style: none;
  font-size: 1.4rem;
  align-items: center;
  cursor: pointer;
}
.chat_display .chat_conversation {
  flex: 1;
  background-color: rgb(246, 246, 246);
}
.chat_display .send_msg_container {
  width: 100%;
  background-color: white;
  padding: 1rem 4.5rem;
}
.send_msg_container {
  display: flex;
  align-items: center;
  gap: 25px;
}

.send_msg_container .send_msg_inpt {
  display: flex;
  align-items: center;
  background-color: #eaeaff;
  padding: 0.6rem 1.2rem;
  border-radius: 50px;
  width: 100%;
  gap: 20px;
}
.send_msg_container .send_msg_inpt .attachments {
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
}
.send_msg_container .send_msg_inpt .input {
  width: 100%;
}
.send_msg_container .send_msg_inpt .input input {
  width: 100%;
  border: none;
  outline: none;
  background-color: transparent;
  font-size: 1rem;
}

.send_msg_container .send_msg_inpt .emoji {
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
}

.send_msg_container .send_msg_btn {
  cursor: pointer;

  color: black;
  font-size: 1.4rem;
  padding: 0.5rem;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: #6366f1;
}