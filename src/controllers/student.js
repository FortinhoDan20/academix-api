const Student = require("../models/student");
const QRCode = require("qrcode");

const addStudent = async (req, res) => {

  try {

    const {
      nom,
      prenom,
      sexe,
      dateNaissance,
      telephoneParent,
    } = req.body;



    const currentYear = new Date().getFullYear();

    const shortYear = currentYear.toString().slice(-2);


    const startYear = new Date(`${currentYear}-01-01`);
    const endYear = new Date(`${currentYear}-12-31`);

    const totalStudents = await Student.countDocuments({
      createdAt: {
        $gte: startYear,
        $lte: endYear,
      },
    });


    const number = totalStudents + 1;


    const paddedNumber = String(number).padStart(3, "0");



    const matricule = `${shortYear}${paddedNumber}`;


    const student = await Student.create({
      schoolId: req.user.schoolId,
      matricule,
      nom,
      prenom,
      sexe,
      dateNaissance,
      telephoneParent,
    });

    const qrData = student._id.toString();

    const qrCode = await QRCode.toDataURL(qrData);

    student.qrCode = qrCode;

    await student.save();

    res.status(201).json({
      error: false,
      message: "Élève enregistré avec succès",
      student,
    });

  } catch (e) {

    res.status(500).json({
      error: true,
      message: e.message,
    });

  }
};

module.exports = {
  addStudent,
};