import { Router } from "express";
import { upload } from "../middelwares/multer.middleware.js";
import {
  createGroup,
  getConversation,
  getDirectConversations,
  getFriendrequest,
  getFriends,
  getGroupConversations,
  getUsers,
  updateProfile,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middelwares/auth.middleware.js";

const router = Router();

router.patch(
  "/update-profile",
  verifyJWT,
  upload.single("avatar"),
  updateProfile
);
router.get("/get_users", verifyJWT, getUsers);
router.get("/get_friends", verifyJWT, getFriends);
router.get("/get_friend_request", verifyJWT, getFriendrequest);
router.get("/get_direct_conversations", verifyJWT, getDirectConversations);
router.get("/get_group_conversations", verifyJWT, getGroupConversations);

router.post("/get_conversation", verifyJWT, getConversation);
router.post("/create_group", verifyJWT, upload.single("avatar"), createGroup);

export default router;
