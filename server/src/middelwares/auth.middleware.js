import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { refreshAccessToken } from "../utils/GenerateToken.js";

export const verifyJWT = async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer", "");

  if (!token) {
    if (req.cookies.refreshToken) {
      refreshAccessToken(req, res, next);
    } else {
      return res.status(401).json({
        status: "error",
        message: "Unathorized request",
      });
    }
  } else {
    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodeToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid Access Token",
      });
    }
    req.user = user;
    next();
  }
};
