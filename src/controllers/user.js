const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const AuditLogger = require("../models/auditLog");

/* =========================================================
   CREATE USER
========================================================= */

const addUser = asyncHandler(async (req, res) => {
  const { name, email, nomUtilisateur, role } = req.body;

  console.log(req.body)

  try {
    
    const schoolId = req.user.schoolId;
  
    if (!name || !email || !nomUtilisateur) {
      return res.status(400).json({
        error: true,
        message: "Tous les champs obligatoires",
      });
    }
  
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = nomUtilisateur.trim().toLowerCase();
  
    const userExist = await User.findOne({
      $or: [{ email: cleanEmail }, { nomUtilisateur: cleanUsername }],
    });
  
    if (userExist) {
      return res.status(409).json({
        error: true,
        message: "Utilisateur déjà existant",
      });
    }
  
    let allowedRole = "secretaire";
  
    if (req.user.role === "admin") {
      if (["manager", "caissier", "secretaire"].includes(role)) {
        allowedRole = role;
      }
    }
  
    if (req.user.role === "super_admin") {
      allowedRole = role || "admin";
    }
  
    const defaultPassword = "012345";
  
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  
    const user = await User.create({
      schoolId,
      name: name.trim(),
      email: cleanEmail,
      nomUtilisateur: cleanUsername,
      role: allowedRole,
      password: hashedPassword,
      mustChangePassword: true,
      createdBy: req.user.id,
    });
  
    await AuditLogger({
      req,
      module: "USER",
      action: "CREATE",
      description: `Création de l'utilisateur ${user.name}`,
      metadata: {
        targetUserId: user._id,
        targetRole: user.role,
        targetEmail: user.email,
      },
    });
  
    res.status(201).json({
      error: false,
      message: "Utilisateur créé avec succès",
      tempPassword: defaultPassword,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        nomUtilisateur: user.nomUtilisateur,
        role: user.role,
      },
    });
  } catch (e) {
    console.log("ERREUR REELLE :", e)
    res.status(500).json({
      error: true,
      message: e.message
    })
  }

});

/* =========================================================
   GET ALL USERS (SUPER ADMIN)
========================================================= */

const getAllUsers = asyncHandler(async (req, res) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      error: true,
      message: "Accès refusé",
    });
  }

  const users = await User.find()
    .select("-password")
    .populate("schoolId", "name");

  res.status(200).json({
    error: false,
    data: users,
  });
});

/* =========================================================
   GET USERS BY SCHOOL
========================================================= */

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({
    schoolId: req.user.schoolId,
  }).select("-password");

  res.status(200).json({
    error: false,
    data: users,
  });
});

/* =========================================================
   GET USER BY ID
========================================================= */

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate("schoolId", "SchoolName address phone") // 👈 école pour affichage UI
    .select("-password");

  if (!user) {
    return res.status(404).json({
      error: true,
      message: "Utilisateur introuvable",
    });
  }

  // ================================
  // ACCESS CONTROL (IMPORTANT)
  // ================================
  const isSuperAdmin = req.user.role === "super_admin";

  const sameSchool =
    user.schoolId &&
    req.user.schoolId &&
    user.schoolId._id.toString() === req.user.schoolId.toString();

  if (!isSuperAdmin && !sameSchool) {
    return res.status(403).json({
      error: true,
      message: "Accès refusé",
    });
  }

  // ================================
  // RESPONSE CLEAN
  // ================================
  return res.status(200).json({
    error: false,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      nomUtilisateur: user.nomUtilisateur,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      school: user.schoolId
        ? {
            id: user.schoolId._id,
            name: user.schoolId.SchoolName  ,
            address: user.schoolId.address,
            phone: user.schoolId.phone,
          }
        : null,
    },
  });
});

/* =========================================================
   UPDATE USER
========================================================= */

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      error: true,
      message: "Utilisateur introuvable",
    });
  }

  if (user.role === "super_admin" && req.user.role !== "super_admin") {
    return res.status(403).json({
      error: true,
      message: "Action non autorisée",
    });
  }

  const { name, email, role, isActive } = req.body;

  if (email) {
    const cleanEmail = email.trim().toLowerCase();

    const exists = await User.findOne({
      email: cleanEmail,
      _id: { $ne: user._id },
    });

    if (exists) {
      return res.status(409).json({
        error: true,
        message: "Email déjà utilisé",
      });
    }

    user.email = cleanEmail;
  }

  user.name = name ?? user.name;

  if (role) {
    if (req.user.role !== "super_admin") {
      return res.status(403).json({
        error: true,
        message: "Modification du rôle interdite",
      });
    }

    const allowedRoles = [
      "super_admin",
      "admin",
      "manager",
      "caissier",
      "secretaire",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        error: true,
        message: "Rôle invalide",
      });
    }

    user.role = role;
  }

  user.isActive = isActive ?? user.isActive;

  user.updatedBy = req.user.id;

  const oldData = {
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };

  await user.save();

  await AuditLogger({
    req,
    module: "USER",
    action: "UPDATE",
    description: `Modification de l'utilisateur ${user.name}`,
    metadata: {
      targetUserId: user._id,
      before: oldData,
      after: {
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    },
  });

  res.status(200).json({
    error: false,
    message: "Utilisateur mis à jour",
    data: user,
  });
});

/* =========================================================
   TOGGLE USER STATUS
========================================================= */

const toggleUserStatus = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    return res.status(404).json({
      error: true,
      message: "Utilisateur introuvable",
    });
  }

  if (targetUser.role === "super_admin") {
    return res.status(403).json({
      error: true,
      message: "Impossible de modifier un super admin",
    });
  }

  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      error: true,
      message: "Accès refusé",
    });
  }

  targetUser.isActive = !targetUser.isActive;

  targetUser.disabledAt = targetUser.isActive ? null : new Date();

  targetUser.disabledBy = targetUser.isActive ? null : req.user.id;

  await targetUser.save();

  await AuditLogger({
    req,
    module: "USER",
    action: targetUser.isActive ? "ACTIVATE" : "DEACTIVATE",
    description: `${
      targetUser.isActive ? "Activation" : "Désactivation"
    } de l'utilisateur ${targetUser.name}`,
    metadata: {
      targetUserId: targetUser._id,
      targetRole: targetUser.role,
    },
  });

  res.status(200).json({
    error: false,
    message: targetUser.isActive
      ? "Utilisateur activé"
      : "Utilisateur désactivé",
    data: {
      id: targetUser._id,
      role: targetUser.role,
      isActive: targetUser.isActive,
    },
  });
});

module.exports = {
  addUser,
  getAllUsers,
  getUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
};
