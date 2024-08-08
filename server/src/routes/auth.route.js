import { Router } from "express";
import {
  RegisterUser,
  forgotpassword,
  loginUser,
  logout,
  resetpassword,
  sendOTP,
  verifyOTP,
} from "../controllers/auth.controller.js";
import { upload } from "../middelwares/multer.middleware.js";
import { verifyJWT } from "../middelwares/auth.middleware.js";

const router = Router();

router.post("/register", upload.single("avatar"), RegisterUser, sendOTP);
router.post("/send-otp", sendOTP);
router.post("/verifyotp", verifyOTP);
router.post("/login", loginUser);
router.post("/forgot-password", forgotpassword);
router.post("/reset-password", resetpassword);
router.post("/logout", verifyJWT, logout);

export default router;
