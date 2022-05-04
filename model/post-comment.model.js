const mongoose = require("mongoose");

const postCommentSchema = new mongoose.Schema(
  {
    textContent: {
      type: String,
      maxlength: 100,
      required: true,
    },
    commentedOn: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
      required: true,
    },
    commentedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
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
postCommentSchema.index({ commentedBy: 1 });
postCommentSchema.index({ commentedOn: 1 });

module.exports = mongoose.model("postComment", postCommentSchema);
