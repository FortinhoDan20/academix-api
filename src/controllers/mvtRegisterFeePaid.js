const Payment = require("../models/payment");
const Fees = require("../models/fees");
const generateReceipt = require("../utils/generateReceipt");
const RevAcademix = require("../models/revAcademix");
const RevSchool = require("../models/revSchool");
const asyncHandler = require("express-async-handler");
const Register = require("../models/register");
const generatePaymentNumber = require("../utils/generatePaymentNumber");

/* const newRegisterPaid = asyncHandler(async (req, res) => {
  try {
    const { registerId, amountPaid, typeFee, month, tranche } = req.body;

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
    if (!register.registrationFeePaid) {
      const feeConfig = await Fees.findOne({
        schoolId: req.user.schoolId,
        cycleId: register.cycleId?._id,
        feeType: "inscription",
      });

      if (!feeConfig) {
        return res.status(404).json({
          message: "Configuration des frais introuvable",
        });
      }

      if (Number(amountPaid) !== Number(feeConfig.amount)) {
        return res.status(400).json({
          message: "Montant incorrect",
        });
      }

      // 1. CREATE PAYMENT
      const payment = await Payment.create({
        schoolId: req.user.schoolId,
        paymentNumber: await generatePaymentNumber(req.user.schoolId),
        registerId,
        amountPaid,
        typeFee: "inscription",
        month,
        tranche,
        cashierId: req.user.id,
      });

      // 2. CALCUL REVENUE (UNIQUEMENT ICI)
      const academixShare = feeConfig.systemFee * 0.7;
      const schoolShare = feeConfig.systemFee * 0.3;

      await RevAcademix.create({
        schoolId: req.user.schoolId,
        paymentId: payment._id,
        registerId: register._id,
        feeConfig: academixShare,
        erp: academixShare * 0.5,
        maintenance: academixShare * 0.1,
        agent: academixShare * 0.4,
      });

      await RevSchool.create({
        schoolId: req.user.schoolId,
        paymentId: payment._id,
        registerId: register._id,
        feeConfig: schoolShare,
      });

      // 3. UPDATE REGISTER
      await Register.findByIdAndUpdate(
        registerId,
        {
          registrationFeePaid: true,
        },
        {
          returnDocument: "after",
          runValidators: true,
        },
      );

      return res.status(201).json({ payment });
    }

    if (register.registrationFeePaid === true) {
      if (Number(amountPaid) > Number(register.reste)) {
        return res.status(400).json({
          message: "Montant supérieur au reste à payer",
        });
      }

      const payment = await Payment.create({
        schoolId: req.user.schoolId,
        paymentNumber: await generatePaymentNumber(req.user.schoolId),
        registerId,
        amountPaid,
        typeFee,
        month,
        tranche,
        cashierId: req.user.id,
      });

      const newRest = register?.reste - amountPaid;

      await Register.findByIdAndUpdate(
        registerId,
        {
          reste: newRest,
        },
        {
          returnDocument: "after",
          runValidators: true,
        },
      );

      return res.status(201).json({ payment });
    }
  } catch (e) {
    console.log("ERREUR :", e);
    console.log("STACK :", e.stack);
    res.status(500).json({ message: e.message });
  }
}); */

const newRegisterPaid = asyncHandler(async (req, res) => {
  try {
    const { registerId, amountPaid, month, tranche } = req.body;

    if (!amountPaid || amountPaid <= 0) {
      return res.status(400).json({
        message: "Montant invalide",
      });
    }

    const register = await Register.findById(registerId)
      .populate("studentId", "matricule nom postnom prenom sexe")
      .populate("yearId", "year")
      .populate("cycleId", "name")
      .populate("sectionId", "name")
      .populate("optionId", "name")
      .populate("classroomId", "name");

    if (!register) {
      return res.status(404).json({
        message: "Inscription introuvable",
      });
    }

    const isInscription = !register.registrationFeePaid;

    // =========================
    // CAS 1 : INSCRIPTION
    // =========================
    if (isInscription) {
      if (!register.cycleId) {
        return res.status(400).json({
          message: "Cycle introuvable pour cette inscription",
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

      if (Number(amountPaid) !== Number(feeConfig.amount)) {
        return res.status(400).json({
          message: "Montant incorrect pour l'inscription",
        });
      }

      const payment = await Payment.create({
        schoolId: req.user.schoolId,
        paymentNumber: await generatePaymentNumber(req.user.schoolId),
        registerId,
        amountPaid,
        typeFee: "inscription",
        month: null,
        tranche: null,
        cashierId: req.user.id,
      });

      const academixShare = feeConfig.systemFee * 0.7;
      const schoolShare = feeConfig.systemFee * 0.3;

      await RevAcademix.create({
        schoolId: req.user.schoolId,
        paymentId: payment._id,
        registerId: register._id,
        feeConfig: academixShare,
        erp: academixShare * 0.5,
        maintenance: academixShare * 0.1,
        agent: academixShare * 0.4,
      });

      await RevSchool.create({
        schoolId: req.user.schoolId,
        paymentId: payment._id,
        registerId: register._id,
        feeConfig: schoolShare,
      });

      await Register.findByIdAndUpdate(registerId, {
        registrationFeePaid: true,
        reste: Math.max(0, feeConfig.amount - amountPaid),
      });

      return res.status(201).json({ payment });
    }

    // =========================
    // CAS 2 : FRAIS SCOLAIRES
    // =========================
    if (!isInscription) {
      const reste = register.reste || 0;

      if (Number(amountPaid) > Number(reste)) {
        return res.status(400).json({
          message: "Montant supérieur au reste à payer",
        });
      }

      const payment = await Payment.create({
        schoolId: req.user.schoolId,
        paymentNumber: await generatePaymentNumber(req.user.schoolId),
        registerId,
        amountPaid,
        typeFee: "frais scolaire",
        month: month || null,
        tranche: tranche || null,
        cashierId: req.user.id,
      });

      const newRest = Math.max(0, reste - amountPaid);

      await Register.findByIdAndUpdate(registerId, {
        reste: newRest,
      });

      return res.status(201).json({ payment });
    }

    // =========================
    // CAS INVALIDE
    // =========================
    return res.status(400).json({
      message: "État d'inscription invalide",
    });

  } catch (e) {
    console.log("ERREUR :", e);
    console.log("STACK :", e.stack);

    return res.status(500).json({
      message: e.message,
    });
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
