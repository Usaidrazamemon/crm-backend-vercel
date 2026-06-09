const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, default: "" },
  userEmail: { type: String, default: "" },
  userRole: { type: String, default: "" },
  action: { type: String, default: "login" },
  ip: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Log", logSchema);
