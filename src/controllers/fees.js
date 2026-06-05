const Fees = require("../models/fees");
const asyncHandler = require("express-async-handler");

// CREATE FEES
const createFees = asyncHandler(async (req, res) => {
  try {
    // 🔐 AUTH CHECK
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé",
      });
    }

    const {
      cycleId,
      yearId,
      amount,
      feeType,
      otherMotif,
    } = req.body;

    // 📌 VALIDATION BASIC
    if (!cycleId || !yearId || !feeType || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Champs obligatoires manquants",
      });
    }

    const baseAmount = Number(amount);

    if (isNaN(baseAmount) || baseAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Montant invalide",
      });
    }

    // 💰 LOGIQUE MÉTIER
    const SYSTEM_FEE = 5;

    let systemFee = 0;

    if (feeType === "inscription") {
      systemFee = SYSTEM_FEE;
    }

    // ⚠️ VALIDATION BUSINESS RULE
    if (feeType === "other" && !otherMotif) {
      return res.status(400).json({
        success: false,
        message: "Le motif est obligatoire pour les frais autres",
      });
    }

    const total = baseAmount + systemFee;

    // 💾 SAVE
    const fees = await Fees.create({
      schoolId: req.user.schoolId,
      cycleId,
      yearId,
      feeType,
      amount: baseAmount,
      otherMotif: feeType === "other" ? otherMotif : null,
      systemFee,
      total,
    });

    return res.status(201).json({
      success: true,
      message: "Frais enregistré avec succès",
      data: fees,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const getAllFees = asyncHandler(async (req, res) => {
  try {
    const fees = await Fees.find({schoolId: req.user.schoolId,}).populate({
        path: "cycleId",
        select: "name",
      })
      .populate({
        path: "yearId",
        select: "year",
      }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: fees,
    });

  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
});

/* const getAllFees = asyncHandler(async (req, res) => {
  try {
    const fees = await Fees.find({
      cycleId: req.params.id,
      schoolId: req.user.schoolId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: fees,
    });

  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
}); */



module.exports = { createFees, getAllFees };