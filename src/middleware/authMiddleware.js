const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const User = require("../models/user");
const School = require("../models/school");


const auth = asyncHandler(async (req, res, next) => {

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {

    try {

      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      const user = await User.findById(decoded.id)
        .select("-password");

      if (!user) {
        return res.status(401).json({
          error: true,
          message: "Utilisateur introuvable",
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          error: true,
          message: "Compte désactivé",
        });
      }

      if (user.role !== "super_admin") {

        // user sans école
        if (!user.schoolId) {
          return res.status(400).json({
            error: true,
            message: "Utilisateur sans école",
          });
        }

        const school = await School.findById(
          user.schoolId
        );

        if (!school) {
          return res.status(404).json({
            error: true,
            message: "École introuvable",
          });
        }

        if (!school.isActive) {
          return res.status(403).json({
            error: true,
            message: "École désactivée",
          });
        }
      }

      req.user = {
        id: user._id,
        role: user.role,
        schoolId: user.schoolId,
      };

      next();

    } catch (e) {

      console.log("AUTH ERROR :", e.message);

      if (e.name === "TokenExpiredError") {

        return res.status(401).json({
          error: true,
          message:
            "Token expiré, veuillez vous reconnecter",
        });
      }

      return res.status(401).json({
        error: true,
        message:
          "Token invalide, veuillez vous reconnecter",
      });
    }

  } else {

    return res.status(401).json({
      error: true,
      message: "Aucun token fourni",
    });
  }
});



const authorize = (...roles) => {

  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {

      return res.status(403).json({
        error: true,
        message: "Accès refusé",
      });
    }

    next();
  };
};

module.exports = {
  auth,
  authorize,
};