const express = require("express");
const authController = require("./../controllers/authController");
const postCommentController = require("./../controllers/postCommentController");
const Router = express.Router({ mergeParams: true });

Router.route("/")
  .post(
    authController.protectAccess,
    postCommentController.verifyPost,
    postCommentController.createComment
  )
  .get(
    authController.protectAccess,
    postCommentController.verifyPost,
    postCommentController.getCommentsByPostId
  );

Router.use(
  "/:commentId",
  authController.protectAccess,
  postCommentController.verifyPost,
  postCommentController.verifyComment
);
Router.route("/:commentId")
  .delete(postCommentController.deleteComment)
  .patch(postCommentController.editComment);

module.exports = Router;
