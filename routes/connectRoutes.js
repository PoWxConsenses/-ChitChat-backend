const express = require("express");
const authController = require("./../controllers/authController");
const connectController = require("./../controllers/connectController");

const Router = express.Router();

Router.route("/").get(
  authController.protectAccess,
  connectController.getRequest
);

Router.route("/:recieverId")
  .post(authController.protectAccess, connectController.sendRequest)
  .delete(authController.protectAccess, connectController.withdrawRequest);

Router.route("/:recieverId/accept").delete(
  authController.protectAccess,
  connectController.acceptRequest
);
Router.route("/:recieverId/ignore").delete(
  authController.protectAccess,
  connectController.ignoreRequest
);
Router.route("/friendSuggestions").get(
  authController.protectAccess,
  connectController.getFriendSuggestion
);

module.exports = Router;
