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
  yearId: {
    type: String,
    ref: "Year",
    required: true
  },
  cycleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cycle",
    required: true
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    
  },
  optionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Option",
  },
  classroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom",
    required: true
  },
  
  registerDate: {
    type: Date,
    default: Date.now
  },

  registrationFeePaid: {
  type: Boolean,
  default: false
},

  tuitionStatus: {
  type: String,
  enum: ["Unpaid", "Partial", "Paid"],
  default: "Unpaid"
},

  // 💰 Gestion financière
  fraisInscription: { type: Number, required: true },
  fraisTotal: { type: Number, required: true },
  montantPaye: { type: Number, default: 0 },
  reste: { type: Number, required: true }

}, { timestamps: true });

module.exports = mongoose.model("Register", registerSchema);