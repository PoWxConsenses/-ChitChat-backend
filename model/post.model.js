const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    textContent: {
      type: String,
      maxlength: 400,
    },
    mediaContent: {
      images: [
        {
          type: String,
          validate: {
            validator: function (v, x, z) {
              return !(this.mediaContent.images.length > 5);
            },
            message: (props) => `${props.value} exceeds maximum array size 5!`,
          },
        },
      ],
      videos: [
        {
          type: String,
          validate: {
            validator: function (v, x, z) {
              return !(this.mediaContent.videos.length > 2);
            },
            message: (props) => `${props.value} exceeds maximum array size 2!`,
          },
        },
      ],
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
postSchema.index({ postedBy: 1 });
module.exports = mongoose.model("Post", postSchema);
