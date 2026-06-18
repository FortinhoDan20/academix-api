const Student = require("../models/student");
const Register = require('../models/register')
const Fees = require('../models/fees')
const QRCode = require("qrcode");
const AuditLogger = require("../models/auditLog");

const mongoose = require("mongoose");

const addStudent = async (req, res) => {
    const session = await mongoose.startSession();

    try {
    session.startTransaction();

    const {
      nom,
      postnom,
      prenom,
      sexe,
      nationalite,
      adresse,
      dateNaissance,
      nomPere,
      nomMere,
      telephonePere,
      telephoneMere,
      yearId,
      cycleId,
      classroomId,
      sectionId,
      optionId,
    } = req.body;

    // ================= VALIDATION =================

    if (
      !nom ||
      !postnom ||
      !prenom ||
      !sexe ||
      !nationalite ||
      !adresse ||
      !dateNaissance ||
      !nomPere ||
      !nomMere ||
      !yearId ||
      !cycleId ||
      !classroomId
    ) {
      throw new Error("Veuillez compléter tous les champs obligatoires.");
    }

    // ================= DATE =================

    const birthDate = new Date(dateNaissance);

    if (isNaN(birthDate.getTime())) {
      throw new Error(
        "Format de date invalide. Utilisez YYYY-MM-DD."
      );
    }

    // ================= MATRICULE =================

    const currentYear = new Date().getFullYear();
    const shortYear = currentYear.toString().slice(-2);

    const totalStudents = await Student.countDocuments({
      schoolId: req.user.schoolId,
    });

    const matricule = `${shortYear}${String(
      totalStudents + 1
    ).padStart(5, "0")}`;

    // ================= FRAIS =================

    const fees = await Fees.findOne({
      schoolId: req.user.schoolId,
      cycleId,
      feeType: "scolaire",
    });

    if (!fees) {
      throw new Error(
        "Aucun frais scolaire configuré pour ce cycle."
      );
    }

    // ================= STUDENT =================

    const student = await Student.create(
      [
        {
          schoolId: req.user.schoolId,
          matricule,
          nom,
          postnom,
          prenom,
          sexe,
          nationalite,
          adresse,
          dateNaissance: birthDate,
          nomPere,
          nomMere,
          telephonePere,
          telephoneMere,
        },
      ],
      { session }
    );

    const createdStudent = student[0];

    // ================= QR CODE =================

    const qrData = `${process.env.FRONTEND_URL}/student-dossier-byqrcode/${createdStudent._id}`;

    const qrCode = await QRCode.toDataURL(qrData);

    createdStudent.qrCode = qrCode;

    await createdStudent.save({ session });

    // ================= REGISTER =================

    const register = await Register.create(
      [
        {
          schoolId: req.user.schoolId,
          studentId: createdStudent._id,
          yearId,
          cycleId,
          sectionId: sectionId || null,
          optionId: optionId || null,
          classroomId,

          registrationFeePaid: false,

          tuitionStatus: "Unpaid",

          fraisTotal: fees.total,
          montantPaye: 0,
          reste: fees.total,
        },
      ],
      { session }
    );

const createdRegister = register[0];

// ================= AUDIT STUDENT =================

await AuditLogger({
  req,
  module: "STUDENT",
  action: "CREATE",
  description: `Nouvel élève enregistré : ${createdStudent.nom} ${createdStudent.postnom}`,
  metadata: {
    studentId: createdStudent._id,
    matricule: createdStudent.matricule,
  },
});

// ================= AUDIT REGISTER =================

await AuditLogger({
  req,
  module: "REGISTER",
  action: "CREATE",
  description: `Nouvelle inscription : ${createdStudent.nom} ${createdStudent.postnom}`,
  metadata: {
    registerId: createdRegister._id,
    studentId: createdStudent._id,
  },
});

// ================= COMMIT =================

await session.commitTransaction();

return res.status(201).json({
  error: false,
  message: "Élève enregistré avec succès",
  data: {
    student: createdStudent,
    register: createdRegister,
  },
});

} catch (error) {
await session.abortTransaction();

return res.status(500).json({
  error: true,
  message: error.message,
});

} finally {
session.endSession();
}
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({ schoolId: req.user.schoolId})
      .populate("schoolId")
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("schoolId");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      message: "Student updated successfully",
      student: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  addStudent,
  getAllStudents,
  getStudentById,
  updateStudent
};