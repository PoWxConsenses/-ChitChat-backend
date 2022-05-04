const Story = require("./../model/story.model");
const User = require("./../model/user.model");

const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.createStory = catchAsync(async (req, res, next) => {
  const { textContent, mediaContent, visibility } = req.body;
  const storyObj = {
    ...{ textContent, mediaContent, visibility },
    postedBy: req.user.id,
  };
  const numberOf = await Story.find({ postedBy: req.user.id });
  if (numberOf.length > 10)
    return next(
      new AppError(
        "daily limit exceed, you can only post 10 story at a time",
        401
      )
    );
  const story = await Story.create(storyObj);
  res.status(200).json({
    status: "OK",
    story,
  });
});

exports.deleteStory = catchAsync(async (req, res, next) => {
  const { storyId } = req.params;
  const findStory = await Story.findById(storyId);
  if (!findStory)
    return res
      .status(404)
      .json({ status: "fail", message: "story not found! with given storyId" });
  if (req.user.id != findStory.postedBy)
    return res.status(401).json({
      status: "fail",
      message: "you are not allowed to perform this action",
    });
  await Story.findByIdAndDelete(storyId);
  // await storyComment.deleteMany({ commentedOn: storyId });
  await res.status(200).json({
    status: "OK",
    message: "story deleted successfully",
  });
});
exports.likeOrUnlike = catchAsync(async (req, res, next) => {
  const { storyId } = req.params;
  const story = await Story.findById(storyId);
  if (!story)
    return res
      .status(404)
      .json({ status: "fail", message: "story not found! with given storyId" });
  const index = story.likes.indexOf(req.user.id);
  if (index > -1) story.likes.splice(index, 1);
  // liked already
  else story.likes.push(req.user.id); // liked now
  await story.save();
  res.status(200).json({
    message: "You just toggled like status",
    isLiked: index > -1 ? false : true,
    likesCount: story.likes.length,
  });
});

exports.getStoryById = catchAsync(async (req, res, next) => {
  const { storyId } = req.params;
  const story = await Story.findById(storyId);
  if (!story)
    return res
      .status(404)
      .json({ status: "fail", message: "story not found! with given storyId" });
  res.status(200).json({ status: "Ok", story });
});

// TODO: Post update
// TODO: Post retrieve, in best way

exports.getUserStory = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const userExist = await User.findById(userId);
  if (!userExist)
    return next(new AppError("user not exist with given Id", 404));
  const followingList = (
    await User.findById(req.user.id).select("followingList")
  ).followingList;

  if (!followingList.includes(userId))
    return next(new AppError("you are not following given user", 401));
  let stories = await Story.find({ postedBy: userId });
  if (!stories) stories = [];
  res.status(200).json({ status: "Ok", stories });
});
