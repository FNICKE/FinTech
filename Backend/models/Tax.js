const mongoose = require("mongoose");

const taxSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  financialYear: {
    type: String,
    required: true, // e.g., "2024-25"
  },
  totalIncome: {
    type: Number,
    required: true,
  },
  deductions: {
    type: Number,
    default: 0,
  },
  taxableIncome: {
    type: Number,
    required: true,
  },
  taxLiability: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Tax", taxSchema);
