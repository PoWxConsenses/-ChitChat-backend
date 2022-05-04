const express = require("express");
const authController = require("../controllers/authController");
const userConnection = require("../controllers/followController");
const Router = express.Router();

Router.route("/").get(
  authController.protectAccess,
  userConnection.getFollowingList
);
Router.route("/:toFollowOrUnfollow")
  .post(authController.protectAccess, userConnection.followUser)
  .patch(authController.protectAccess, userConnection.unfollowUser)
  .get(authController.protectAccess, userConnection.doUserFollow);

module.exports = Router;
