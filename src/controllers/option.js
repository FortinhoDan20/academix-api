const Options = require("../models/options");
const Section = require("../models/section");
const asyncHandler = require("express-async-handler");

/* ================= FORMAT NAME ================= */
const formatName = (str) => {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const addOption = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: true,
      message: "Accès refusé",
    });
  }

  try {
    let { name } = req.body;
    const { sectionId } = req.body;

    // 🔥 CLEAN NAME
    const cleanName = formatName(name);

    const section = await Section.findById(sectionId);

    if (!section) {
      return res.status(404).json({
        error: true,
        message: "Section introuvable",
      });
    }

    const options = new Options({
      name: cleanName,
      schoolId: req.user.schoolId,
      cycleId: section.cycleId,
      sectionId: sectionId,
    });

    await options.save();

    res.status(201).json({
      error: false,
      message: `${cleanName} a été enregistré avec succès !`,
      data: options,
    });

  } catch (e) {
    res.status(500).json({
      error: true,
      message: e.message,
    });
  }
});

const getAllOptions = asyncHandler(async (req, res) => {
  try {
    const options = await Options.find({
      schoolId: req.user.schoolId,
    }).populate({
        path: "sectionId",
        select: "name",
      }).sort({ name: 1 });

    res.status(200).json({
      error: false,
      data: options,
    });
  } catch (e) {
    res.status(500).json({
      error: true,
      message: e.message,
    });
  }
});

module.exports = { addOption, getAllOptions };