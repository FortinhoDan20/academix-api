const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      default: null, // null pour super_admin
    },

    name: { type: String, required: true, uppercase: true },

    email: { type: String, unique: true, index: true },

    nomUtilisateur: { type: String, unique: true, index: true },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["super_admin", "manager", "admin", "caissier", "secretaire"]
    },

    isActive: {
      type: Boolean,
      default: true,
    },
      // 🔐 Protection brute force
  loginAttempts: {
    type: Number,
    default: 0
  },

  lockUntil: {
    type: Date,
    default: null
  },
  
     lastLogin: {
    type: Date,
    default: null
  },
  isAuthenticated:{
    type: Boolean,
    default: false
  },
  disabledAt: {
  type: Date,
  default: null,
},

mustChangePassword: {
  type: Boolean,
  default: true,
},

createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
},

updatedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
},

disabledBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
},
  },
  { timestamps: true },
);


module.exports = mongoose.model("User", userSchema);
