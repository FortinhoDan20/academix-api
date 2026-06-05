const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    matricule: {
      type: String,
      unique: true,
    },

    nom: {
      type: String,
      required: true,
    },

    prenom: {
      type: String,
      required: true,
    },

    sexe: {
      type: String,
      enum: ["Masculin", "Feminin"],
    },

    dateNaissance: Date,

    telephoneParent: String,



    qrCode: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);