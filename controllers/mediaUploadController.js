const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const fs = require("fs");
const multer = require("multer");
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

exports.uploadMediaContent = upload.fields([
  { name: "imgOrVideo", maxCount: 1 },
]);

exports.resizeMedia = catchAsync(async (req, res, next) => {
  if (req.files && req.files.imgOrVideo && req.files.imgOrVideo.length >= 1) {
    await Promise.all(
      req.files.imgOrVideo.map(async (mediaContent, idx) => {
        let fileName = "";
        if (mediaContent.mimetype.startsWith("image")) {
          fileName = `storyImage-${req.user.id}-${Date.now() + idx}.jpeg`;
          await sharp(mediaContent.buffer)
            .resize(2000, 1333)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toFile(`public/storyMediaContent/images/${fileName}`);
        }
        if (mediaContent.mimetype.startsWith("video")) {
          fileName = `storyVideo-${req.user.id}-${Date.now() + idx}.mp4`;
          fs.writeFile(
            `public/storyMediaContent/videos/${fileName}`,
            mediaContent.buffer,
            "binary",
            function (err) {
              if (err) throw err;
            }
          );
        }
        fileName ? (req.body.mediaContent = fileName) : null;
      })
    );
  }
  next();
});
