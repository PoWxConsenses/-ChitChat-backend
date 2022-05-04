const mongoose = require("mongoose");

const storyCommentSchema = new mongoose.Schema(
  {
    textContent: {
      type: String,
      maxlength: 100,
      required: true,
    },
    commentedOn: {
      type: mongoose.Schema.ObjectId,
      ref: "Story",
      required: true,
    },
    commentedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    likedBy: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);
storyCommentSchema.index({ commentedBy: 1 });
storyCommentSchema.index({ commentedOn: 1 });

module.exports = mongoose.model("storyComment", storyCommentSchema);
