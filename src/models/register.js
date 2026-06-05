const mongoose = require("mongoose");

const registerSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  anneeScolaire: {
    type: String,
    required: true
  },
  classe: String,
  dateInscription: {
    type: Date,
    default: Date.now
  },
  statut: {
    type: String,
    default: "actif"
  },

  // 💰 Gestion financière
  fraisTotal: { type: Number, required: true },
  montantPaye: { type: Number, default: 0 },
  reste: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model("Inscription", registerSchema);