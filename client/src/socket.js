import { io } from "socket.io-client";

let socket;

const connectSocket = (auth_id) => {
  return new Promise((resolve, reject) => {
    socket = io("https://chatapp-1ghd.onrender.com", {
      query: { auth_id },
    });

    socket.on("connect", () => {
      // console.log('connect')
      resolve(socket);
    });

    socket.on("connect_error", (err) => {
      reject(err);
    });
  });
};

export { socket, connectSocket };
