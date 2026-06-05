const Section = require("../models/section");
const asyncHandler = require("express-async-handler");
const Cycle = require('../models/cycle')

// CREATE SECTION
const createSection = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Vous n'êtes pas autorisé",
    });
  }

  try {
    const { name, cycleId } = req.body;

    if (!name || !cycleId) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont obligatoires",
      });
    }

    // ✅ Première lettre en majuscule
    const cleanName =
      name.trim().charAt(0).toUpperCase() +
      name.trim().slice(1).toLowerCase();

    const cycle = await Cycle.findById(cycleId);

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: "Cycle introuvable",
      });
    }

    const existingSection = await Section.findOne({
      schoolId: req.user.schoolId,
      cycleId,
      name: {
        $regex: new RegExp(`^${cleanName}$`, "i"),
      },
    });

    if (existingSection) {
      return res.status(409).json({
        success: false,
        message: "Cette section existe déjà",
      });
    }

    const section = await Section.create({
      name: cleanName,
      schoolId: req.user.schoolId,
      cycleId,
    });

    return res.status(201).json({
      success: true,
      message: "Section créée avec succès",
      data: section,
    });

  } catch (e) {
    res.status(400).json({
      error: true,
      message: e.message,
    });
  }
});
// GET SECTIONS PAR CYCLE
const getAllSectionCyle = asyncHandler(async (req, res) => {
  try {
    const sections = await Section.find({
      cycleId: req.params.id,
      schoolId: req.user.schoolId,
    }).sort({ name: 1 });

    res.status(200).json({
      error: false,
      sections,
    });
  } catch (e) {
    res.status(400).json({
      error: true,
      message: e.message,
    });
  }
});
const getAllSection = asyncHandler(async (req, res) => {
  try {
    const sections = await Section.find({ schoolId: req.user.schoolId })
      .sort({ name: 1 })
      .populate({
        path: "cycleId",
        select: "name",
      });

    res.status(200).json({
      error: false,
      sections,
    });
  } catch (e) {
    res.status(400).json({
      error: true,
      message: e.message,
    });
  }
});

// GET ONE SECTION
const getSection = asyncHandler(async (req, res) => {
  try {
    const section = await Section.findOne({
      _id: req.params.id,
      schoolId: req.user.schoolId,
    });

    res.status(200).json({
      error: false,
      section,
    });
  } catch (e) {
    res.status(400).json({
      error: true,
      message: e.message,
    });
  }
});

module.exports = {
  createSection,
  getAllSection,
  getAllSectionCyle,
  getSection,
};
