const User = require("../models/user");
const bcrypt = require("bcryptjs");
const School = require('../models/school')
const jwt = require('jsonwebtoken')
const asyncHandler = require("express-async-handler");
const loginLog = require("../models/loginLog");


const MAX_ATTEMPTS = Number(process.env.MAX_ATTEMPTS) || 5;
const LOCK_TIME = Number(process.env.LOCK_TIME) || 15 * 60 * 1000;


/* =========================================================
   ADD USER
========================================================= */

const addUser = asyncHandler(async (req, res) => {

  const { name, email, nomUtilisateur, role } = req.body;

  const schoolId = req.user.schoolId;


  if (!name || !email || !nomUtilisateur) {
    return res.status(400).json({
      error: true,
      message: "Tous les champs sont obligatoires",
    });
  }



  const cleanEmail = email.trim().toLowerCase();

  const cleanUsername = nomUtilisateur
    .trim()
    .toLowerCase();



  const userExist = await User.findOne({
    $or: [
      { email: cleanEmail },
      { nomUtilisateur: cleanUsername },
    ],
  });

  if (userExist) {
    return res.status(409).json({
      error: true,
      message: "Nom utilisateur ou email déjà utilisé",
    });
  }



  let allowedRole = "secretaire";

  if (req.user.role === "admin") {

    if (
      ["manager", "caissier", "secretaire"].includes(role)
    ) {
      allowedRole = role;
    }
  }

  if (req.user.role === "super_admin") {
    allowedRole = role || "admin";
  }



  const user = await User.create({
    schoolId,
    name: name.trim(),
    email: cleanEmail,
    nomUtilisateur: cleanUsername,
    role: allowedRole,
  });


  res.status(201).json({
    error: false,
    message:
      "Utilisateur créé avec succès et email envoyé",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      nomUtilisateur: user.nomUtilisateur,
      role: user.role,
    },
  });
});



const loginUser = asyncHandler(async (req, res) => {
  let { nomUtilisateur, password } = req.body;

  // ================================
  // VALIDATION
  // ================================
  if (!nomUtilisateur || !password) {
    return res.status(400).json({
      error: true,
      message: "Nom utilisateur et mot de passe requis",
    });
  }

  nomUtilisateur = nomUtilisateur.trim().toLowerCase();

  try {
    // ================================
    // FIND USER
    // ================================
    const user = await User.findOne({ nomUtilisateur });

    const logData = {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    };  

    const FAKE_HASH =
      process.env.FAKE_HASH ||
      "$2b$10$CwTycUXWue0Thq9StjUM0uJ8e0J6u2Jq6v2n1ytY1/6VXOvNhbbXK";

    let isMatch = false;

    // ================================
    // CHECK LOCK
    // ================================
    if (user && user.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil(
        (user.lockUntil - Date.now()) / 1000
      );

      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;

       await LoginLog.create({
          userId: user._id,
          ...logData,
          status: "FAILED",
          message: "Compte temporairement bloqué",
        });

      return res.status(423).json({
        error: true,
        message: "Compte temporairement bloqué",
        retryAfter: remainingTime,
        retryAfterHuman: `${minutes} min ${seconds} sec`,
      });
    }

    // ================================
    // PASSWORD CHECK (ANTI TIMING ATTACK)
    // ================================
    if (user) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      await bcrypt.compare(password, FAKE_HASH);
    }

    // ================================
    // LOGIN FAILED
    // ================================
    if (!user || !isMatch) {
      if (user) {
        user.loginAttempts += 1;

        if (user.loginAttempts >= MAX_ATTEMPTS) {
          user.lockUntil = Date.now() + LOCK_TIME;
          user.loginAttempts = 0;
        }

        await user.save();
      }

      await loginLog.create({
        ...logData,
        status: "FAILED",
        message: "Identifiants incorrects",
      });

      return res.status(401).json({
        error: true,
        message: "Identifiants incorrects",
      });
    }

   // ================================
    // ACCOUNT STATUS
    // ================================
    if (!user.isActive) {

      await LoginLog.create({
      userId: user._id,
      ...logData,
      status: "FAILED",
      message: "Compte utilisateur désactivé",
    });

      return res.status(403).json({
        error: true,
        message: "Compte désactivé",
      });
    }

    // ================================
    // SCHOOL CHECK
    // ================================
    if (user.role !== "super_admin" && user.schoolId) {
      const school = await School.findById(user.schoolId);

      if (!school) {

         await LoginLog.create({
          userId: user._id,
          ...logData,
          status: "FAILED",
          message: "École introuvable",
        });
        
        return res.status(403).json({
          error: true,
          message: "École introuvable",
        });
      }

      if (!school.isActive) {

         await LoginLog.create({
          userId: user._id,
          ...logData,
          status: "FAILED",
          message: "École désactivée",
        });

        return res.status(403).json({
          error: true,
          message: "École désactivée",
        });
      }
    }

    // ================================
    // RESET LOGIN ATTEMPTS
    // ================================
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();

    
    await user.save();

      await LoginLog.create({
    userId: user._id,
    schoolId: user.schoolId,
    ...logData,
    status: "SUCCESS",
    message: "Connexion réussie",
  });

    // ================================
    // GENERATE TOKEN
    // ================================
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        schoolId: user.schoolId,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "1d" }
    );

    // ================================
    // RESPONSE
    // ================================
    return res.status(200).json({
      error: false,
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        nomUtilisateur: user.nomUtilisateur,
        role: user.role,
        schoolId: user.schoolId,
        lastLogin: user.lastLogin,
      },
    });
  } catch (e) {
    console.error("LOGIN ERROR :", e);

    return res.status(500).json({
      error: true,
      message: "Erreur serveur lors de la connexion",
    });
  }
});

const getLoginHistory = asyncHandler(async (req, res) => {
  const logs = await LoginLog.find()
    .populate("userId", "name nomUtilisateur role")
    .sort({ createdAt: -1 });

  res.json({
    error: false,
    data: logs,
  });
});


module.exports = { addUser, loginUser, getLoginHistory };
