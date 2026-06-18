const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  paymentNumber: {
    type: String,
    unique: true,
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true
  },
  registerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Register",
    required: true
  },
  cashierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amountPaid: { type: Number, required: true },

  typeFee: String,

  modePaiement: String,
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);