const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const postRouter = require("./routes/postRoutes");
const followRouter = require("./routes/followRoutes");
const connectRouter = require("./routes/connectRoutes");
const storyRouter = require("./routes/storyRoutes");
const chatRouter = require("./routes/chatRoutes");
const globalErrorHandler = require("./controllers/errorController");

const bodyParser = require("body-parser");
const AppError = require("./utils/appError");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "10kb" }));

// Routes
app.use("/api/public", express.static(path.join(__dirname, "public")));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/story", storyRouter);
app.use("/api/follow", followRouter);
app.use("/api/connect", connectRouter);
app.use("/api/chat", chatRouter);

app.all("*", (req, res, next) => {
  return next(
    new AppError(
      `${req.originalUrl}, this route is not found on this server`,
      404
    )
  );
});

// if (process.env.NODE_ENV == "production") {
//   app.use(express.static(path.join(__dirname, "../client/build")));
//   // The "catchall" handler: for any request that doesn't
//   // match one above, send back React's index.html file.
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname + "../client/build/index.html"));
//   });
// }
app.use(globalErrorHandler);

module.exports = app;
