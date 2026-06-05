const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      default: null,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    module: {
      type: String,
      required: true,
    },

    action: {
      type: String,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "VIEW",
        "ACTIVATE",
        "DEACTIVATE",
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    ip: String,

    metadata: Object,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);