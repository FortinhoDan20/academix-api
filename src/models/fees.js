const mongoose = require("mongoose");

const feesSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    cycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cycle",
      required: true,
    },

    yearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Year",
      required: true,
    },

    feeType: {
      type: String,
      enum: ["inscription", "scolaire", "other"],
      required: true,
    },

    otherMotif: {
      type: String,
      default: null,
      required: function () {
        return this.feeType === "other";
      },
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    systemFee: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fees", feesSchema);