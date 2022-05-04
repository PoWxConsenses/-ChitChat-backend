const express = require("express");
const chatController = require("./../controllers/chatController");
const authController = require("./../controllers/authController");
const Router = express.Router();

Router.route("/:receiverId")
  .post(authController.protectAccess, chatController.createChat)
  .get(authController.protectAccess, chatController.getChats);

Router.route("/:chatId")
  .patch(authController.protectAccess, chatController.updateChat)
  .delete(authController.protectAccess, chatController.deleteChat);
module.exports = Router;
