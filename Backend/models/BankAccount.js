const mongoose = require("mongoose");

const bankAccountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  balance: { type: Number, required: true },
  income: { type: Number, default: 0 },
  lastSynced: { type: String, default: new Date().toISOString() },
  status: { type: String, default: "Connected" },
});

module.exports = mongoose.model("BankAccount", bankAccountSchema);
