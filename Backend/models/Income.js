const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  source: { type: String, required: true },
  description: { type: String },
  bankAccount: { type: mongoose.Schema.Types.ObjectId, ref: "BankAccount", required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Income", incomeSchema);