const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const postComment = require("./../model/post-comment.model");
const Post = require("./../model/post.model");

exports.verifyPost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const post = await Post.findById(postId);
  if (!post) return next(new AppError("Post not found with given id", 404));
  // req.Post = post;
  next();
});

exports.verifyComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const comment = await postComment.findById(commentId);
  if (!comment)
    return next(new AppError("comment not found with given id", 404));
  // req.Comment = comment;
  next();
});

exports.createComment = catchAsync(async (req, res, next) => {
  if (!req.body.textContent)
    return next(new AppError("textContent cann't be empty", 406));
  const comment = await postComment.create({
    commentedOn: req.params.postId,
    textContent: req.body.textContent,
    commentedBy: req.user.id,
  });
  res.status(200).json({
    status: "OK",
    message: "comment created successfully",
    comment,
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  await postComment.findByIdAndDelete(req.params.commentId);
  res.status(200).json({
    status: "OK",
    message: "comment delete successfully",
  });
});

exports.editComment = catchAsync(async (req, res, next) => {
  const { editedTextContent } = req.body;
  if (!editedTextContent)
    return next(new AppError("editedTextContent cann't be empty", 406));
  const editedComment = await postComment.findByIdAndUpdate(
    req.params.commentId,
    { textContent: editedTextContent },
    { new: true }
  );
  res.status(200).json({
    status: "OK",
    message: "comment edited successfully",
    editedComment,
  });
});

exports.getCommentsByPostId = catchAsync(async (req, res, next) => {
  const postComments = await postComment.find({
    commentedOn: req.params.postId,
  });
  let reponseObj = {};
  if (req.query.onlyCommentCount) {
    reponseObj = {
      commentCount: postComments.length,
    };
  } else {
    reponseObj = {
      postComments,
    };
  }
  res.status(200).json({
    message: "post comments are here",
    status: "OK",
    ...reponseObj,
  });
});

exports.likeorUnlike = catchAsync((req, res, next) => {
  res.status(200).json({
    message: "route not yet defined",
  });
});
