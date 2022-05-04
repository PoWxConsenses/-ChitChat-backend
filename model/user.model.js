const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { nanoid } = require("nanoid");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    phoneNumber: {
      type: String,
      minlength: 10,
    },
    userName: {
      type: String,
      unique: true,
      required: [true, "Please confirm your userName"],
      message: "userName already taken",
    },
    DOB: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    coverPhoto: {
      type: String,
      default: "defaultCoverPhoto.jpeg",
    },
    passwordChangedAt: Date,
    roomId: {
      type: String,
      default: nanoid(),
    },
    friendList: [
      {
        select: false,
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    followingList: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        select: false,
      },
    ],
    followersCount: Number,
    canUserFollowYou: {
      type: Boolean,
      default: true,
    },
    canUserRequestForFriendShip: {
      type: Boolean,
      default: true,
    },
    about: {
      type: String,
      maxlength: 50,
    },
    Address: {
      street: String,
      city: String,
      postelCode: String,
      country: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (this.isNew) {
    if (this.gender === "male") this.profilePhoto = "defaultMProfilePhoto.jpeg";
    else this.profilePhoto = "defaultFProfilePhoto.jpeg";
  }
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.CheckPass = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.PasswordChanged = function (ExpiresAt) {
  if (this.passwordChangedAt) {
    const ChangeAtInms = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return ExpiresAt < ChangeAtInms;
  }
  return false;
};

module.exports = mongoose.model("User", userSchema);
