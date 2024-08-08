import mongoose from "mongoose";

const oneToOneMessageSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    admin: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    avatar: {
      type: String,
    },
    messages: [
      {
        to: [
          {
            type: mongoose.Schema.ObjectId,
            ref: "User",
          },
        ],
        from: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        type: {
          type: String,
          enum: ["Text", "Media", "Document", "Link"],
        },
        created_at: {
          type: Date,
          default: Date.now(),
        },
        text: {
          type: String,
        },
        file: {
          type: String,
        },
      },
    ],
    unreadmessages: [
      {
        to: [
          {
            type: mongoose.Schema.ObjectId,
            ref: "User",
          },
        ],
        from: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        type: {
          type: String,
          enum: ["Text", "Media", "Document", "Link"],
        },
        created_at: {
          type: Date,
          default: Date.now(),
        },
        text: {
          type: String,
        },
        file: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

const OneToOneMessage = new mongoose.model(
  "OneToOneMessage",
  oneToOneMessageSchema
);

export default OneToOneMessage;
