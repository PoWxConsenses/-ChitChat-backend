const User = require("../model/user.model");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.followUser = catchAsync(async (req, res, next) => {
  const { toFollowOrUnfollow } = req.params;
  const isUserExist = await User.findById(toFollowOrUnfollow);
  if (!isUserExist)
    return next(new AppError("user not exist with provided id", 404));
  if (!isUserExist.canUserFollowYou)
    return next(new AppError("User doen't allow others to follow him", 401));
  const currentUser = await User.findById(req.user.id).select("followingList");
  if (currentUser.followingList.includes(isUserExist._id))
    return next(new AppError("You are already following him", 200));
  currentUser.followingList.push(isUserExist._id);
  await currentUser.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "OK",
    message: `You are succesfully following ${isUserExist.firstName}`,
    isFollowing: true,
  });
});

exports.unfollowUser = catchAsync(async (req, res, next) => {
  const { toFollowOrUnfollow } = req.params;
  const isUserExist = await User.findById(toFollowOrUnfollow);
  if (!isUserExist)
    return next(new AppError("user not exist with provided id", 404));
  const currentUser = await User.findById(req.user.id).select("followingList");
  if (!currentUser.followingList.includes(isUserExist._id))
    return next(new AppError("You are not following him", 200));

  const idIndex = currentUser.followingList.indexOf(isUserExist._id);
  currentUser.followingList.splice(idIndex, 1);
  await currentUser.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "OK",
    message: `You are succesfully unfollowed ${isUserExist.firstName}`,
    isFollowing: false,
  });
});
exports.doUserFollow = catchAsync(async (req, res, next) => {
  const doUserFollow = (
    await User.findById(req.user.id).select("followingList")
  ).followingList.includes(req.params.toFollowOrUnfollow);
  res.status(200).json({ status: "OK", doUserFollow });
});
exports.getFollowingList = catchAsync(async (req, res, next) => {
  const followingList = (
    await User.findById(req.user.id)
      .select("followingList")
      .lean()
      .populate("followingList", "firstName lastName profilePhoto")
  ).followingList;
  res.status(200).json({ status: "OK", followingList });
});
