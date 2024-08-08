// updateProfile

import FriendRequest from "../models/friendRequest.js";
import OneToOneMessage from "../models/OneToOneMessage.js";
import User from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { filterObj } from "../utils/filterObj.js";

const updateProfile = async (req, res, next) => {
  const filteredBody = filterObj(req.body, "userName", "about", "email");
  const avatarLocalpath = req.file?.path;
  let avatar;
  if (avatarLocalpath) {
    avatar = await uploadCloudinary(avatarLocalpath);
  }

  if (avatar?.url) {
    filteredBody.avatar = avatar.url;
  }
  // console.log(filteredBody);
  const userDoc = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    validateModifiedOnly: true,
  });

  res.status(200).json({
    status: "success",
    data: userDoc,
    message: "User Updated successfully",
  });
};

const getUsers = async (req, res, next) => {
  const all_users = await User.find({ verified: true }).select(
    "_id userName avatar about"
  );

  const this_user = await User.findById(req.user._id);

  const remaining_users = all_users.filter((user) => {
    // console.log(this_user.friends.includes(user._id));
    return (
      !this_user.friends.includes(user._id) &&
      user._id.toString() !== req.user._id.toString()
    );
  });
  res.status(200).json({
    status: "success",
    data: remaining_users,
    message: "Users found successfully!",
  });
};

const getFriends = async (req, res, next) => {
  const this_user = await User.findById(req.user._id).populate("friends");
  // const user = await User.findById(req.user._id);
  // console.log(this_user);
  res.status(200).json({
    status: "success",
    data: this_user.friends,
    message: "friends found successfully",
  });
};

const getFriendrequest = async (req, res, next) => {
  const requests = await FriendRequest.find({
    recipient: req.user._id,
  })
    .select("_id sender")
    .populate({
      path: "sender",
      select: "_id userName avatar status",
    });
  // console.log(requests);
  res.status(200).json({
    status: "success",
    data: requests,
    message: "friend requests found successfully",
  });
};

const getDirectConversations = async (req, res, next) => {
  try {
    const Existing_Direct_Conversations = await OneToOneMessage.find({
      type: "individual",
      participants: { $size: 2, $all: [req.user._id] },
    }).populate("participants");

    return res.status(200).json({
      status: "success",
      data: Existing_Direct_Conversations,
      message: "Existing DirectConversations found successfully",
    });
  } catch (err) {
    // Handle error appropriately
    console.error("Error finding directconversations:", err);
    return res.status(400).json({
      status: "Error",
      data: null,
      message: "Error while fetching the DirectConversations",
    });
  }
};

const getGroupConversations = async (req, res, next) => {
  try {
    const Existing_Group_Conversations = await OneToOneMessage.find({
      type: "group",
      $or: [
        { participants: { $all: [req.user._id] } },
        { admin: req.user._id },
      ],
    }).populate("participants");

    return res.status(200).json({
      status: "success",
      data: Existing_Group_Conversations,
      message: "Existing GroupConversations found successfully",
    });
  } catch (err) {
    // Handle error appropriately
    console.error("Error finding groupconversations:", err);
    return res.status(400).json({
      status: "Error",
      data: null,
      message: "Error while fetching the GroupConversations",
    });
  }
};

const getConversation = async (req, res, next) => {
  const { conversation_id } = req.body;
  const conversation =
    await OneToOneMessage.findById(conversation_id).populate("participants");
  const hasMessages = conversation.messages.length > 0;
  if (hasMessages) {
    return res.status(200).json({
      status: "success",
      data: conversation,
      message: "Conversation found successfully",
    });
  }
  return res.status(200).json({
    status: "success",
    data: null,
    message: "Conversation Notfound due to no Messages successfully",
  });
};

const createGroup = async (req, res, next) => {
  const { title, users, admin, chat_type } = req.body;
  const avatarLocalpath = req.file?.path;
  let avatar;
  if (avatarLocalpath) {
    avatar = await uploadCloudinary(avatarLocalpath);
  }

  let group_created = await OneToOneMessage.create({
    title,
    participants: JSON.parse(users),
    admin,
    type: chat_type,
    avatar: avatar?.url || "",
  });
  group_created = await OneToOneMessage.findById(group_created._id).populate(
    "participants"
  );

  return res.status(200).json({
    status: "success",
    data: group_created,
    message: "group_created successfully",
  });
};

export {
  updateProfile,
  getUsers,
  getFriends,
  getFriendrequest,
  getDirectConversations,
  getGroupConversations,
  getConversation,
  createGroup,
};
