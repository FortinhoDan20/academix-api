const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true
  },
  inscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inscription",
    required: true
  },
  montant: { type: Number, required: true },
  typeFrais: String,
  modePaiement: String,
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);