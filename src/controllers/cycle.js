const Cycle = require("../models/cycle");
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




/* ================= SLUG ================= */
const generateSlug = (name) => {
  const ignoreWords = ["de", "la", "du", "des", "et", "d"];

  return name
    .toLowerCase()
    .split(" ")
    .filter(word => !ignoreWords.includes(word))
    .map(word => word.charAt(0).toUpperCase())
    .join("");
};

/* ================= ADD CYCLE ================= */
const addCycle = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: true,
      message: "Accès refusé",
    });
  }

  try {
    let { name } = req.body;

    if (!name) {
      return res.status(400).json({
        error: true,
        message: "Nom obligatoire",
      });
    }

    const cleanName = formatName(name);
    const slug = generateSlug(cleanName);

    const cycle = new Cycle({
      name: cleanName,
      schoolId: req.user.schoolId,
      slug,
    });

    await cycle.save();

    return res.status(201).json({
      error: false,
      message: `${cleanName} a été enregistré avec succès !`,
      data: cycle,
    });

  } catch (e) {
    return res.status(500).json({
      error: true,
      message: e.message,
    });
  }
});

/* ================= GET ALL ================= */
const getAllCycle = asyncHandler(async (req, res) => {
  try {
    const cycles = await Cycle.find({
      schoolId: req.user.schoolId,
    }).sort({ name: 1 });

    res.status(200).json({
      error: false,
      cycles,
    });

  } catch (e) {
    res.status(500).json({
      error: true,
      message: e.message,
    });
  }
});

/* ================= GET ONE ================= */
const getCycle = asyncHandler(async (req, res) => {
  try {
    const cycle = await Cycle.findById(req.params.id);

    return res.status(200).json({
      error: false,
      cycle,
    });

  } catch (e) {
    return res.status(500).json({
      error: true,
      message: e.message,
    });
  }
});

/* ================= DELETE ================= */
const deleteCycle = asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: true,
        message: "Accès refusé",
      });
    }

    await Cycle.findByIdAndDelete(req.params.id);

    res.status(200).json({
      error: false,
      message: "Cycle supprimé avec succès !",
    });

  } catch (e) {
    res.status(500).json({
      error: true,
      message: e.message,
    });
  }
});

module.exports = {
  addCycle,
  getAllCycle,
  getCycle,
  deleteCycle,
};