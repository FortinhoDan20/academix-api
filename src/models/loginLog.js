const mongoose = require("mongoose");

const loginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
    },

    ip: String,
    userAgent: String,

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
    },

    message: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoginLog", loginLogSchema);