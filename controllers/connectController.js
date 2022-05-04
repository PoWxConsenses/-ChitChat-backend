const User = require("../model/user.model");
const Connect = require("../model/connect.model");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const isRecieverUserExist = async (next, recieverId) => {
  const isExistUser = await User.findById(recieverId);
  if (!isExistUser) next(new AppError("user doen't exist", 400));
  return isExistUser;
};

const addFriend = catchAsync(async (user1, user2) => {
  const User1 = await User.findById(user1.id).select("friendList").exec();
  const User2 = await User.findById(user2._id).select("friendList");
  User1.friendList.push(user2._id);
  User2.friendList.push(user1.id);
  await User1.save({ validateBeforeSave: false });
  await User2.save({ validateBeforeSave: false });
  await Connect.deleteOne({
    sentBy: user2._id,
    recievedBy: user1.id,
  });
  await Connect.deleteOne({
    sentBy: user1.id,
    recievedBy: user2._id,
  });
});

exports.sendRequest = catchAsync(async (req, res, next) => {
  const { recieverId } = req.params;
  const isExistUser = await isRecieverUserExist(next, recieverId);
  if (!isExistUser) return;
  if (req.user.id == isExistUser._id)
    return next(new AppError("you cann't be friend of yourself here", "401"));
  const friendList = (await User.findById(req.user.id).select("friendList"))
    .friendList;
  if (friendList.includes(isExistUser._id))
    return next(new AppError("you both guys are already friend", 200));
  if (!isExistUser.canUserRequestForFriendShip)
    return next(
      new AppError("user is not allowing others to send request", 401)
    );
  const ifAlreadySent = await Connect.find({
    sentBy: req.user.id,
    recievedBy: isExistUser._id,
  });
  if (ifAlreadySent.length == 1)
    return next(
      new AppError("You have already sent friend request to the user", 200)
    );
  const isAlreadyRecieved = await Connect.find({
    sentBy: isExistUser._id,
    recievedBy: req.user.id,
  });
  if (isAlreadyRecieved.length == 1) {
    await addFriend(req.user, isExistUser);
    return res.status(200).json({
      status: "OK",
      message: "both of you are friends from now",
    });
  }
  const tt = await Connect.create({
    sentBy: req.user.id,
    recievedBy: isExistUser._id,
    message: req.body.message,
  });
  res.status(200).json({
    status: "OK",
    message: "friend request has been sent",
  });
});

exports.withdrawRequest = catchAsync(async (req, res, next) => {
  const { recieverId } = req.params;
  const isExistUser = await isRecieverUserExist(next, recieverId);
  if (!isExistUser) return;
  const isInvitation = await Connect.find({
    sentBy: req.user.id,
    recievedBy: isExistUser._id,
  });
  if (!isInvitation.length)
    return next(
      new AppError("you never request this user for friendship", 200)
    );
  await Connect.findByIdAndDelete(isInvitation[0]._id);
  res.status(200).json({
    status: "OK",
    message: "friend request has been withdraw",
  });
});

exports.acceptRequest = catchAsync(async (req, res, next) => {
  const { recieverId } = req.params;
  const isExistUser = await isRecieverUserExist(next, recieverId);
  if (!isExistUser) return;
  const isInvitation = await Connect.find({
    sentBy: isExistUser._id,
    recievedBy: req.user.id,
  });
  if (!isInvitation.length)
    return next(new AppError("you don't have invitation", 404));
  await addFriend(req.user, isExistUser);
  res.status(200).json({
    status: "OK",
    message: "friend request has been accepted",
  });
});

exports.ignoreRequest = catchAsync(async (req, res, next) => {
  const { recieverId } = req.params;
  const isExistUser = await isRecieverUserExist(next, recieverId);
  if (!isExistUser) return;
  const isInvitation = await Connect.find({
    sentBy: isExistUser._id,
    recievedBy: req.user.id,
  });
  if (!isInvitation.length)
    return next(new AppError("you don't have invitation", 404));
  await Connect.findByIdAndDelete(isInvitation[0]._id);
  res.status(200).json({
    status: "OK",
    message: "friend request has been ignored",
  });
});

exports.getFriendSuggestion = catchAsync(async (req, res, next) => {
  const friendList = (await User.findById(req.user.id).select("friendList"))
    .friendList;
  const friendSuggestion = await User.find({
    $and: [{ _id: { $ne: req.user.id } }, { _id: { $nin: friendList } }],
  });
  res.status(200).json({
    status: "OK",
    message: "here is user suggestion for you",
    friendSuggestion,
  });
});

exports.getRequest = catchAsync(async (req, res, next) => {
  const requests = await Connect.find({ recievedBy: req.user.id }).populate({
    path: "sentBy",
  });
  res.status(200).json({
    message: "here is the list of users who reuested friendship to you.",
    status: "OK",
    requests,
  });
});
