import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";

const app = express();

app.use(
  cors({
    // origin: "*",
    origin: ["http://localhost:5173", "http://100.104.156.141:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/v1/auth", authRoute);
app.use("/v1/user", userRoute);

export { app };
