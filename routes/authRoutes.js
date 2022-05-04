const express = require("express");
const authController = require("./../controllers/authController");

const Router = express.Router();

Router.route("/signIn").post(authController.signIn);
Router.route("/signUp").post(authController.signUp);
Router.route("/forgotPassword").post(authController.forgotPassword);
Router.route("/signOut").get(authController.signOut);

module.exports = Router;
