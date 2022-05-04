const express = require("express");
const authController = require("./../controllers/authController");
const storyController = require("./../controllers/storyController");
const mediaUploadController = require("./../controllers/mediaUploadController");

const Router = express.Router();

Router.route("/").post(
  authController.protectAccess,
  mediaUploadController.uploadMediaContent,
  mediaUploadController.resizeMedia,
  storyController.createStory
);
Router.route("/user/:userId").get(
  authController.protectAccess,
  storyController.getUserStory
);
Router.route("/:storyId")
  .delete(authController.protectAccess, storyController.deleteStory)
  .patch(authController.protectAccess, storyController.likeOrUnlike)
  .get(authController.protectAccess, storyController.getStoryById);

module.exports = Router;
