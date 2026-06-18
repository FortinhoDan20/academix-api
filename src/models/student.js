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
        set: (v) => v?.trim().toUpperCase(),
      },

      postnom: {
        type: String,
        required: true,
        set: (v) => v?.trim().toUpperCase(),
      },
      prenom: {
        type: String,
        required: true,
        set: (v) => v?.trim().toUpperCase(),
      },

      sexe: {
        type: String,
        enum: ["M", "F"],
      },

      nationalite: {
        type: String,
        required: true,
        set: (v) => v?.trim().toUpperCase(),
      },
      adresse: {
        type: String,
        required: true,
        set: (v) => v?.trim().toUpperCase(),
      },
      
      dateNaissance: {
        type: Date,
        required: true,
        default: Date.now
      },
      
      nomPere: {
        type: String,
        required: true,
        set: (v) => v?.trim().toUpperCase(),
      },

      nomMere: {
        type: String,
        required: true,
        set: (v) => v?.trim().toUpperCase(),
      },

      telephonePere: String,

      telephoneMere: String,

      qrCode: {
        type: String,
      },
    },
    { timestamps: true }
  );

  module.exports = mongoose.model("Student", studentSchema);