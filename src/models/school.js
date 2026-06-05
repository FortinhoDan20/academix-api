const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  SchoolName: { type: String, required: true },
  phone: String,
  address: String,
  slug: String,
  isActive: {
      type: Boolean,
      default: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("School", schoolSchema);