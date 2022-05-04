const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    textContent: {
      type: String,
      maxlength: 400,
    },
    mediaContent: {
      type: String,
    },
    postedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    visibility: {
      type: String,
      enum: ["public", "follower", "private", "friends"],
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);
storySchema.index({ postedBy: 1 });
module.exports = mongoose.model("Story", storySchema);
