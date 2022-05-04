const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("./../model/user.model");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const SignToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = SignToken(user._id);
  const JWT_COOKIE_EXPIRES_IN = 30;
  res.cookie("jwt", token, {
    expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "OK",
    token: token,
    user,
  });
};

exports.protectAccess = catchAsync(async (req, res, next) => {
  // 1) Get token and checks if it's exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (req.cookies.jwt) token = req.cookies.jwt;
  if (!token) {
    return next(
      new AppError("You are not Logged in! Please Login to get access", 401)
    );
  }

  // 2) validate if Token is valid
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if User still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The User Belonging to this token does no longer exists !",
        401
      )
    );
  }

  // 4) Check if User changed Password after the token was issued
  if (currentUser.PasswordChanged(decoded.iat)) {
    return next(
      new AppError("User Recently Changed Password! Please Login Again", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTES
  req.user = currentUser;
  next();
});

exports.signUp = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, DOB, gender, passwordConfirm } =
    req.body;
  const userName =
    firstName.toLowerCase() +
    "_" +
    Math.random().toString(36).substr(2, 9) +
    "_" +
    Date.now().toString(36).substr(2, 9);
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    passwordConfirm,
    DOB,
    gender,
    userName,
  });
  createSendToken(user, 200, req, res);
});

exports.signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!password || !email) {
    return next(new AppError("Username or password required", 500));
  }
  const user = await User.findOne({ email }).select("+password");
  if (user && (await user.CheckPass(password, user.password))) {
    createSendToken(user, 200, req, res);
  } else {
    return next(new AppError("email and Password is not correct", 401));
  }
});
//
exports.forgotPassword = (req, res) => {
  res.end("RFVbtjkf");
};

exports.signOut = (req, res, next) => {
  res.cookie("jwt", "", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "OK",
    token: "",
  });
};
