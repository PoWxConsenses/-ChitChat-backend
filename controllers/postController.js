const Post = require("./../model/post.model");
const postComment = require("./../model/post-comment.model");

const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const fs = require("fs");
const multer = require("multer");
const { Readable } = require("stream");

const sharp = require("sharp");

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image") || file.mimetype.startsWith("video")) {
    cb(null, true);
  } else {
    cb(
      new AppError("neither image nor video! Upload Appropiate content!!", 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPostMediaContent = upload.fields([
  { name: "postImages", maxCount: 5 },
  { name: "postVideos", maxCount: 2 },
]);

exports.resizePhotoCoverPhoto = catchAsync(async (req, res, next) => {
  req.body.mediaContent = {
    images: [],
    videos: [],
  };
  req.body.mediaContent.images = [];
  req.body.mediaContent.videos = [];
  if (req.files.postImages)
    await Promise.all(
      req.files.postImages.map(async (img, idx) => {
        const fileName = `postImage-${req.user.id}-${Date.now() + idx}.jpeg`;
        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`public/postMediaContent/images/${fileName}`);
        req.body.mediaContent.images.push(fileName);
      })
    );
  if (req.files.postVideos)
    req.files.postVideos.map((vid, idx) => {
      const fileName = `postVideo-${req.user.id}-${Date.now() + idx}.mp4`;
      fs.writeFile(
        `public/postMediaContent/videos/${fileName}`,
        vid.buffer,
        "binary",
        function (err) {
          if (err) throw err;
        }
      );

      req.body.mediaContent.videos.push(fileName);
    });
  next();
});

exports.createPost = catchAsync(async (req, res, next) => {
  const { textContent, mediaContent, visibility } = req.body;
  const postObj = {
    ...{ textContent, mediaContent, visibility },
    postedBy: req.user.id,
  };
  const post = await Post.create(postObj);
  res.status(200).json({
    status: "OK",
    post,
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const findPost = await Post.findById(postId);
  if (!findPost)
    return res
      .status(404)
      .json({ status: "fail", message: "post not found! with given postId" });
  if (req.user.id != findPost.postedBy)
    return res.status(401).json({
      status: "fail",
      message: "you are not allowed to perform this action",
    });
  const { images, videos } = findPost.mediaContent;
  images.map((image) =>
    fs.unlink(
      `${__dirname}/../public/postMediaContent/images/${image}`,
      (err) => {
        if (err) throw err;
      }
    )
  );
  videos.map((video) =>
    fs.unlink(
      `${__dirname}/../public/postMediaContent/videos/${video}`,
      (err) => {
        if (err) throw err;
      }
    )
  );
  await Post.findByIdAndDelete(postId);
  await postComment.deleteMany({ commentedOn: postId });
  await res.status(200).json({
    status: "OK",
    message: "post deleted successfully",
  });
});
exports.likeOrUnlike = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const post = await Post.findById(postId);
  if (!post)
    return res
      .status(404)
      .json({ status: "fail", message: "post not found! with given postId" });
  const index = post.likes.indexOf(req.user.id);
  if (index > -1) post.likes.splice(index, 1);
  // liked already
  else post.likes.push(req.user.id); // liked now
  post.save();
  res.status(200).json({
    message: "You just toggled like status",
    isLiked: index > -1 ? false : true,
    likesCount: post.likes.length,
  });
});
exports.getPostById = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const post = await Post.findById(postId);
  if (!post)
    return res
      .status(404)
      .json({ status: "fail", message: "post not found! with given postId" });
  res.status(200).json({ status: "Ok", post });
});

// TODO: Post update
// TODO: Post retrieve, in best way

exports.getIndividualFeed = catchAsync(async (req, res, next) => {
  const post = await Post.find().populate({ path: "postedBy" });
  res.status(200).json({ status: "Ok", post });
});

exports.getPostByUserId = catchAsync(async (req, res, next) => {
  const post = await Post.find({ postedBy: req.params.userId });
  // .populate({
  //   path: "postedBy",
  // });
  res.status(200).json({ status: "Ok", post });
});
