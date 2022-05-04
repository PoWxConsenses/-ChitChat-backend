const express = require("express");
const postController = require("./../controllers/postController");
const authController = require("./../controllers/authController");
const postCommentRoutes = require("./postCommentRoutes");
const Router = express.Router();

Router.use("/:postId/comment", postCommentRoutes);
Router.route("/")
  .post(
    authController.protectAccess,
    postController.uploadPostMediaContent,
    postController.resizePhotoCoverPhoto,
    postController.createPost
  )
  .get(authController.protectAccess, postController.getIndividualFeed);

Router.route("/:postId")
  .delete(authController.protectAccess, postController.deletePost)
  .get(authController.protectAccess, postController.getPostById)
  .patch(authController.protectAccess, postController.likeOrUnlike);

Router.route("/user/:userId").get(
  authController.protectAccess,
  postController.getPostByUserId
);

module.exports = Router;
