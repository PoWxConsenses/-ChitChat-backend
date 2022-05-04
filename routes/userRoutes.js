const express = require("express");
const authContoller = require("./../controllers/authController");
const userController = require("./../controllers/userController");

const Router = express.Router();

Router.route("/").patch(
  authContoller.protectAccess,
  userController.uploadPhoto,
  userController.resizePhoto,
  userController.updateUser
);
Router.route("/loggedInUser").get(
  authContoller.protectAccess,
  userController.getCurrentLoggedInUser
);
Router.route("/getUserWithUserName/:userName").get(
  authContoller.protectAccess,
  userController.getUserWithUserName
);
Router.route("/friendList").get(
  authContoller.protectAccess,
  userController.getFriends
);
Router.route("/:userId").get(
  authContoller.protectAccess,
  userController.getUserWithUserId
);
module.exports = Router;
