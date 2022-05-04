const User = require("./../model/user.model");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const { findByIdAndUpdate } = require("./../model/user.model");

exports.getCurrentLoggedInUser = (req, res, next) => {
  res.status(200).json({
    status: "OK",
    user: req.user,
  });
};

exports.getFriends = async (req, res, next) => {
  const friendList = (
    await User.findById(req.user.id).select("friendList").populate({
      path: "friendList",
    })
  ).friendList;
  res.status(200).json({
    status: "OK",
    friendList: friendList,
  });
};

exports.getUserWithUserName = async (req, res, next) => {
  const { userName } = req.params;
  const user = await User.find({ userName }).exec();
  res.status(200).json({
    status: "OK",
    user: user[0],
  });
};

exports.getUserWithUserId = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId).select(
    "profilePhoto firstName lastName userName"
  );
  if (!user) return next(new AppError("user not found with given userId", 404));
  res.status(200).json({
    status: "OK",
    message: "user found",
    user: user,
  });
});
////

///

///
const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image") || file.mimetype.startsWith("video")) {
    cb(null, true);
  } else {
    cb(
      new AppError("neither image nor video! Upload Appropiate content!!", 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhoto = upload.fields([
  { name: "coverPhoto", maxCount: 1 },
  { name: "profilePhoto", maxCount: 1 },
]);

exports.resizePhoto = catchAsync(async (req, res, next) => {
  if (req.files) {
    if (req.files.coverPhoto)
      await Promise.all(
        req.files.coverPhoto.map(async (coverPhoto, idx) => {
          const fileName = `coverPhoto-${req.user.id}-${Date.now() + idx}.jpeg`;
          await sharp(coverPhoto.buffer)
            .resize(2000, 1333)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toFile(`public/user/coverPhoto/${fileName}`);
          fileName ? (req.body.coverPhoto = fileName) : null;
        })
      );
    if (req.files.profilePhoto)
      await Promise.all(
        req.files.profilePhoto.map(async (profilePhoto, idx) => {
          const fileName = `profilePhoto-${req.user.id}-${
            Date.now() + idx
          }.jpeg`;
          await sharp(profilePhoto.buffer)
            .resize({
              fit: sharp.fit.contain,
              width: 800,
            })
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toFile(`public/user/profilePhoto/${fileName}`);
          fileName ? (req.body.profilePhoto = fileName) : null;
        })
      );
  }
  next();
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const filterList = [
    "firstName",
    "lastName",
    "DOB",
    "userName",
    "phoneNumber",
    "isActive",
    "profilePhoto",
    "coverPhoto",
    "canUserFollowYou",
    "canUserRequestForFriendShip",
    "about",
  ];
  const filteredObject = {};
  filterList.map((key) => {
    if (key in req.body) filteredObject[key] = req.body[key];
  });
  if (filteredObject.coverPhoto) {
    if (req.user.coverPhoto !== "defaultCoverPhoto.jpeg")
      fs.unlink(
        `${__dirname}/../public/user/coverPhoto/${req.user.coverPhoto}`,
        (err) => {
          if (err) throw err;
        }
      );
  }
  if (filteredObject.profilePhoto) {
    if (
      req.user.profilePhoto !== "defaultFProfilePhoto.jpeg" &&
      req.user.profilePhoto !== "defaultMProfilePhoto.jpeg"
    )
      fs.unlink(
        `${__dirname}/../public/user/profilePhoto/${req.user.profilePhoto}`,
        (err) => {
          if (err) throw err;
        }
      );
  }
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredObject,
    { new: true }
  );
  res.status(200).json({
    message: "user updated succesfully",
    status: "OK",
    user: updatedUser,
  });
});
