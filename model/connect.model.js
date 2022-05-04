const mongoose = require("mongoose");

const connectSchema = new mongoose.Schema(
  {
    sentBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    recievedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      maxlength: 100,
    },
  },
  { timestamps: true }
);
connectSchema.index({ sentBy: 1 });
connectSchema.index({ recievedBy: 1 });

module.exports = mongoose.model("Connect", connectSchema);
