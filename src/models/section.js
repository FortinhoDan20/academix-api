const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School",
        required: true
    },
    cycleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cycle",
        required: true
    },
   name: {
      type: String,
      required: true,
      trim: true,

    },
}, { timestamps: true });

// ✅ NOM DU MODEL CORRECT
const Section = mongoose.model('Section', sectionSchema);

module.exports = Section;