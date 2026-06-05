const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const School = require("../models/school");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

const createSchool = asyncHandler(async (req, res) => {

    if (req.user.role !== "super_admin") {
        return res.status(403).json({
            error: true,
            message: "Accès refusé"
        });
    }

    const session = await mongoose.startSession();

    // 🧠 Utils internes
    const formatAddress = (address) => {
        if (!address) return "";
        return address
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const generateSlug = (name) => {
        const ignoreWords = ["de", "la", "du", "des", "et"];

        return name
            .toLowerCase()
            .split(" ")
            .filter(word => !ignoreWords.includes(word))
            .map(word => word.charAt(0).toUpperCase())
            .join("");
    };

    try {

        session.startTransaction();

        const { SchoolName, phone, name, email, nomUtilisateur, password, address } = req.body;

        if (!SchoolName || !name || !nomUtilisateur || !password) {
            throw new Error("Champs obligatoires manquants");
        }

        // 🔍 Vérifier école existante
        const existingSchool = await School.findOne({ SchoolName }).session(session);
        if (existingSchool) {
            throw new Error("École déjà existante");
        }

        // 🔍 Vérifier admin existant
        const existingUser = await User.findOne({
            $or: [{ email }, { nomUtilisateur }]
        }).session(session);

        if (existingUser) {
            throw new Error("Admin déjà existant");
        }

        // 🔐 Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 🎯 FORMATAGE
        const formattedAddress = formatAddress(address);
        let slug = generateSlug(SchoolName);

        // 🔥 éviter doublon slug
        const existingSlug = await School.findOne({ slug }).session(session);
        if (existingSlug) {
            slug = slug + Math.floor(Math.random() * 100);
        }

        // 🏫 Création école
        const [school] = await School.create([{
            SchoolName,
            phone,
            address: formattedAddress,
            slug
        }], { session });

        // 👨‍💼 Création admin
        const [admin] = await User.create([{
            schoolId: school._id,
            name,
            email,
            nomUtilisateur,
            password: hashedPassword,
            role: "admin"
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            error: false,
            message: "École et admin créés avec succès",
            data: {
                school,
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email
                }
            }
        });

    } catch (error) {

        await session.abortTransaction();
        session.endSession();

        res.status(400).json({
            error: true,
            message: error.message
        });
    }

});

const getAllSchools = asyncHandler(async(req, res) => {

        if (req.user.role !== "super_admin") {
            return res.status(403).json({
                error: true,
                message: "Accès refusé"
            });
         }


    try {
        
         const schools = await School.find().sort({ createdAt: -1 });

    res.status(200).json({
        error: false,
        data: schools
    });
        
    } catch (e) {

        res.status(400).json({
            error: true,
            message: e.message
        });
    }
})

const getSchool = asyncHandler(async(req, res) => {

        if (req.user.role !== "super_admin") {
            return res.status(403).json({
                error: true,
                message: "Accès refusé"
            });
        }

    try {
        const school = await School.findById(req.params.id )

                if (!school) {
            return res.status(404).json({
                error: true,
                message: "École introuvable"
            });
        }

        const users = await User.find({ schoolId: req.params.id }).select("-password");

        const schoolData = {
            school,
            users
        }

          res.status(200).json({
            error: false,
            message: "École récupérée avec succès",
            data: schoolData,
        });
        
    } catch (e) {
        res.status(500).json({
            error: true,
            message: e.message
        });
    }
})

module.exports = { createSchool, getAllSchools, getSchool }