const Register = require('../models/register')
const asyncHandler = require('express-async-handler')


const getAllRegister = asyncHandler(async (req, res) => {

    const registers = await Register.find({
        schoolId: req.user.schoolId,
        registrationFeePaid: true
    })
    .populate("studentId", "matricule nom postnom prenom sexe")
    .populate("yearId", "year")
    .populate("cycleId", "name")
    .populate("sectionId", "name")
    .populate("optionId", "name")
    .populate("classroomId", "name");

    const effectif = registers.length;

    const garcons = registers.filter(
        (item) => item.studentId?.sexe === "M"
    ).length;

    const filles = registers.filter(
        (item) => item.studentId?.sexe === "F"
    ).length;

    res.status(200).json({
        error: false,
        effectif,
        garcons,
        filles,
        data: registers
    });

});

const allRegisterNoFeePaid = asyncHandler(async (req, res) => {

    const registers = await Register.find({
        schoolId: req.user.schoolId,
        registrationFeePaid: false
    })
    .populate("studentId", "matricule nom postnom prenom sexe")
    .populate("yearId", "year")
    .populate("cycleId", "name")
    .populate("sectionId", "name")
    .populate("optionId", "name")
    .populate("classroomId", "name");



    res.status(200).json({
        error: false,
        data: registers
    });

});

const detailsRegister = asyncHandler(async(req, res)  => {

     try {
        const resgister = await Register.findById(req.params.id)
        .populate({
            path: "studentId",
            select: "matricule nom postnom prenom sexe"
            })
        .populate({
            path: "yearId",
            select: "year"
            })
        .populate({
            path: "cycleId",
            select: "name"
            })
        .populate({
            path: "sectionId",
            select: "name"
            })
        .populate({
            path: "optionId",
            select: "name"
            })
        .populate({
            path: "classroomId",
            select: "name"
            })
        
        res.status(200).json({
            error: false,
            data: resgisterList
        })
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
})

module.exports ={
    getAllRegister,
    allRegisterNoFeePaid,
    detailsRegister
}
