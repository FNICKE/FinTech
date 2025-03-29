const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BankAccount",
    required: true,
  },
  description: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  isSuspicious: { type: Boolean, default: false },
  currency: {
    type: String,
    default: "INR", // Default to INR if not specified
    required: true,
  }, // New field for anomaly detection
});

module.exports = mongoose.model("Transaction", transactionSchema);
