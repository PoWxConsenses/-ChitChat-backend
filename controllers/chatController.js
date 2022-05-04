const Chat = require("./../model/chat.model");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("../model/user.model");

exports.createChat = catchAsync(async (req, res, next) => {
  const { receiverId } = req.params;
  const receiver = await User.findById(receiverId);
  if (!receiver) return next(new AppError("user not found with given Id", 404));
  const friendList = (await User.findById(req.user.id).select("friendList"))
    .friendList;
  if (!friendList.includes(receiverId))
    return next(new AppError("given user is not your friend", 401));
  const chat = await Chat.create({
    textContent: req.body.textContent,
    sender: req.user.id,
    receiver: receiverId,
  });
  res.status(200).json({
    message: "chat created successfully",
    chat,
  });
});

exports.updateChat = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const chat = await Chat.findById(chatId);
  if (!chat) return next(new AppError("chat not found with given Id", 404));

  // if (chat.sender !== req.user.id || chat.receiver !== req.user.id)
  //   return next(new AppError("not allowed to perform this action", 401));
  const attr = ["textContent", "status"];
  let dataObj = {};
  attr.map((key) => {
    if (key in req.body) dataObj[key] = req.body[key];
  });
  const updatedChat = await Chat.findByIdAndUpdate(chatId, dataObj, {
    new: true,
  });
  res.status(200).json({
    status: "OK",
    message: "chat has been updated",
    chat: updatedChat,
  });
});

exports.deleteChat = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const chat = await Chat.findOneAndDelete({
    _id: chatId,
    sender: req.user.id,
  });
  if (!chat)
    return next(
      new AppError(
        "chat not found with given Id or you are not authorize to delete this chat",
        401
      )
    );
  res.status(200).json({
    status: "OK",
    message: "chat has been deleted",
  });
});
exports.getChats = catchAsync(async (req, res, next) => {
  const { receiverId } = req.params;
  const receiver = await User.findById(receiverId);
  if (!receiver) return next(new AppError("user not found with given Id", 404));
  const friendList = (await User.findById(req.user.id).select("friendList"))
    .friendList;
  if (!friendList.includes(receiverId))
    return next(new AppError("given user is not your friend", 401));
  await Chat.updateMany(
    {
      sender: receiverId,
      receiver: req.user.id,
      status: { $in: ["sent", "delivered"] },
    },
    { status: "read" }
  );
  const chats = await Chat.find({
    $or: [
      {
        sender: req.user.id,
        receiver: receiverId,
      },
      {
        sender: receiverId,
        receiver: req.user.id,
      },
    ],
  }).sort({ createdAt: "ascending" });
  // .limit(20);

  res.status(200).json({
    message: "friend chats",
    chats,
  });
});
