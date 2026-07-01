const Register = require("../models/register");
const Fees = require('../models/fees')
const Student = require("../models/student")
const Year = require("../models/anneeScolaire");
const asyncHandler = require("express-async-handler");
const AuditLogger = require("../models/auditLog");


const registerStudent = asyncHandler(async(req, res) => {

  try {

       const { yearId, cycleId, classroomId, sectionId, optionId } = req.body;

    // ================= VALIDATION =================

    if (!yearId || !cycleId || !classroomId ) {

      throw new Error("Veuillez compléter tous les champs obligatoires.");
    }

    const registerExist = await Register.findOne({studentId: req.params.id})
    
    if(!registerExist){
      return res.status(404).json({
        message: "l'inscription est introuvable",
      });
    }


    // ================= FRAIS =================
    
    const fees = await Fees.findOne({
          schoolId: req.user.schoolId,
          cycleId,
          feeType: "inscription",
          status:"ONGOING"
        });
    
        if (!fees) {
          throw new Error("Aucun frais scolaire configuré pour ce cycle.");
        }
    
    await Register.findByIdAndUpdate (req.params.id ,{ status: COMPLETED, yearStatus:FINISHED },
          {
            returnDocument: "after",
            runValidators: true
          } 
        );
    
    const register = await Register.create(
        
            {
              schoolId: req.user.schoolId,
              studentId: req.params.id,
              yearId,
              cycleId,
              sectionId: sectionId || null,
              optionId: optionId || null,
              classroomId,
    
              registrationFeePaid: false,
              fraisInscription: fees.amount,
              tuitionStatus: "Unpaid",
    
              fraisTotal: fees.total,
              montantPaye: 0,
              reste: fees.total,
            },
          
        );
    
  } catch (e) {
    
  }
})

const getAllRegister = asyncHandler(async (req, res) => {
  try {
    const currentYear = await Year.findOne({
      current: true,
    });

    if (!currentYear) {
      return res.status(404).json({
        message: "Aucune année scolaire en cours.",
      });
    }

    const registers = await Register.find({
      schoolId: req.user.schoolId,
      yearId: currentYear._id,
      registrationFeePaid: true,
    })
      .populate("studentId", "matricule nom postnom prenom sexe")
      .populate("yearId", "year")
      .populate("cycleId", "name")
      .populate("sectionId", "name")
      .populate("optionId", "name")
      .populate("classroomId", "name");

    const effectif = registers.length;

    const garcons = registers.filter(
      (item) => item.studentId?.sexe === "M",
    ).length;

    const filles = registers.filter(
      (item) => item.studentId?.sexe === "F",
    ).length;

    res.status(200).json({
      error: false,
      effectif,
      garcons,
      filles,
      data: registers,
    });
  } catch (e) {
    res.status(500).json({
        error: true,
        message: e.message
    })
  }
});

const allRegisterNoFeePaid = asyncHandler(async (req, res) => {
  try {
    const currentYear = await Year.findOne({
      current: true,
    });

    if (!currentYear) {
      return res.status(404).json({
        message: "Aucune année scolaire en cours.",
      });
    }

    const registers = await Register.find({
      schoolId: req.user.schoolId,
      yearId: currentYear._id,
      registrationFeePaid: false,
    })
      .populate("studentId", "matricule nom postnom prenom sexe")
      .populate("yearId", "year")
      .populate("cycleId", "name")
      .populate("sectionId", "name")
      .populate("optionId", "name")
      .populate("classroomId", "name");

    res.status(200).json({
      error: false,
      data: registers,
    });
  } catch (e) {
    res.status(500).json({
      error: true,
      message: e.message,
    });
  }
});

const detailsRegister = asyncHandler(async (req, res) => {
  try {
    const resgister = await Register.findById(req.params.id)
      .populate({
        path: "studentId",
        select: "matricule nom postnom prenom sexe",
      })
      .populate({
        path: "yearId",
        select: "year",
      })
      .populate({
        path: "cycleId",
        select: "name",
      })
      .populate({
        path: "sectionId",
        select: "name",
      })
      .populate({
        path: "optionId",
        select: "name",
      })
      .populate({
        path: "classroomId",
        select: "name",
      });

    res.status(200).json({
      error: false,
      data: resgisterList,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = {
  getAllRegister,
  allRegisterNoFeePaid,
  detailsRegister,
};
