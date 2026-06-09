const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // ============ BASIC INFO ============
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    // ============ ROLE ============
    role: {
      type: String,
      enum: ["agent", "verifier", "admin"],
      default: "agent",
    },

    // ============ AGENT TYPE ============
    // Sirf agent role ke liye relevant hoga
    agentType: {
      type: String,
      enum: ["Inhouse", "Agent", "D2D Sales", ""],
      default: "",
    },

    // ============ AGENT ID ============
    agentId: {
      type: String,
      default: "",
    },

    // ============ CONTACT ============
    phone: {
      type: String,
      default: "",
    },

    // ============ STATUS ============
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true, // createdAt aur updatedAt auto
  }
);

module.exports = mongoose.model("User", UserSchema);
