const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: true,
      unique: true,
    },

    commissionPercent: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);