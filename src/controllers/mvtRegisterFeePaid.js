const Payment = require("../models/payment");
const Fees = require("../models/fees");
const generateReceipt = require("../utils/generateReceipt");
const RevAcademix = require("../models/revAcademix");
const RevSchool = require("../models/revSchool");
const asyncHandler = require("express-async-handler");
const Register = require("../models/register");
const generatePaymentNumber = require("../utils/generatePaymentNumber");

const newRegisterPaid = asyncHandler(async (req, res) => {
  try {
    const { registerId, amountPaid, typeFee } = req.body;

    if (!amountPaid || amountPaid <= 0) {
      return res.status(400).json({
        message: "Montant invalide",
      });
    }

    const register = await Register.findById(registerId)
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

    if (!register) {
      return res.status(404).json({
        message: "Inscription introuvable",
      });
    }
    const existingPayment = await Payment.findOne({ registerId, typeFee });

    if (existingPayment) {
      return res.status(400).json({
        message: "Ces frais ont déjà été payés",
      });
    }
    const feeConfig = await Fees.findOne({
      schoolId: req.user.schoolId,
      cycleId: register.cycleId._id,
      feeType: "inscription",
    });

    if (!feeConfig) {
      return res.status(404).json({
        message: "Configuration des frais d'inscription introuvable",
      });
    }

    const academixShare = feeConfig.systemFee * 0.7;
    const schoolShare = feeConfig.systemFee * 0.3;

    if (Number(amountPaid) !== Number(feeConfig.amount)) {
      return res.status(400).json({
        message: "Le montant ne correspond pas aux frais d'inscription",
      });
    }

    const paymentNumber = await generatePaymentNumber(req.user.schoolId);

    const payment = await Payment.create({
      schoolId: req.user.schoolId,
      paymentNumber,
      registerId,
      amountPaid,
      typeFee,
      cashierId: req.user.id,
    });
    const revAcademix = await RevAcademix.create({
      schoolId: req.user.schoolId,
      paymentId: payment._id,
      registerId: register._id,
      feeConfig: academixShare,
      erp: academixShare * 0.5,
      maintenance: academixShare * 0.1,
      agent: academixShare * 0.4,
    });
    const revSchool = await RevSchool.create({
      schoolId: req.user.schoolId,
      paymentId: payment._id,
      registerId: register._id,
      feeConfig: schoolShare,
    });

    await Register.findByIdAndUpdate(registerId, { registrationFeePaid: true });

    res.status(201).json({
      error: false,
      data: { payment, revAcademix, revSchool}
    })
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

const getAllRegisterPaid = asyncHandler(async (req, res) => {
  try {
    const payments = await Payment.find({
      schoolId: req.user.schoolId,
      registrationFeePaid: true,
    })
      .populate("cashierId")
      .populate({
        path: "registerId",
        populate: [
          {
            path: "studentId",
            select: "matricule nom postnom prenom sexe",
          },
          {
            path: "classroomId",
            select: "name",
          },
          {
            path: "cycleId",
            select: "name",
          },
          {
            path: "yearId",
            select: "year",
          },
          {
            path: "sectionId",
            select: "name",
          },
          {
            path: "optionId",
            select: "name",
          },
        ],
      });

    res.status(200).json({
      error: false,
      data: payments,
    });
  } catch (e) {
    res.status(500).json({
      error: true,
      message: e.message,
    });
  }
});

const getRegisterRecu = asyncHandler(async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("cashierId")
      .populate("schoolId", "SchoolName")
      .populate({
        path: "registerId",
        populate: [
          {
            path: "studentId",
            select: "matricule nom postnom prenom sexe",
          },
          {
            path: "classroomId",
            select: "name",
          },
          {
            path: "cycleId",
            select: "name",
          },
          {
            path: "yearId",
            select: "year",
          },
          {
            path: "sectionId",
            select: "name",
          },
          {
            path: "optionId",
            select: "name",
          },
         
        ],
      });

    if (!payment) {
      return res.status(404).json({
        error: true,
        message: "Paiement introuvable",
      });
    }

    res.status(200).json({
      error: false,
      data: payment,
    });
  } catch (e) {
    res.status(500).json({
      error: true,
      message: e.message,
    });
  }
});

module.exports = { newRegisterPaid, getAllRegisterPaid, getRegisterRecu };
