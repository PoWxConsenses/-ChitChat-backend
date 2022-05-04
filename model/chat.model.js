const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    textContent: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  { timestamps: true }
);
chatSchema.index({ sender: 1, receiver: 1 });
chatSchema.index({ sender: 1 });
chatSchema.index({ receiver: 1 });
module.exports = mongoose.model("Chat", chatSchema);
