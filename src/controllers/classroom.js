const Classroom = require("../models/classroom");
const asyncHandler = require("express-async-handler");

const addClassroom = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Vous n'êtes pas autorisé",
    });
  }

  try {
    const { name, sectionId, cycleId, optionId, nombrePlace  } = req.body;
    console.log(req.body);

    const classroom = new Classroom({
      name,
      schoolId: req.user.schoolId,
      cycleId,
      sectionId,
      optionId,
      nombrePlace
    });

    await classroom.save();

    res.status(201).json({
      error: false,
      message: `${name} a été enregistré avec succès !`,
      data: classroom,
    });
  } catch (e) {
    res.status(400).json({
      error: true,
      message: e.message,
    });
  }
});

const getAllClassrooms = asyncHandler(async (req, res) => {
  try {
    const classroom = await Classroom.find({ schoolId: req.user.schoolId }).sort({ name: 1 })
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
      });

    res.status(200).json({
      error: false,
      data: classroom,
    });
  } catch (e) {
    res.status(403).json({
      error: true,
      message: e.message,
    });
  }
});

module.exports = { addClassroom, getAllClassrooms };
