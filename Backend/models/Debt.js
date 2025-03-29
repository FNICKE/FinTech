const mongoose = require("mongoose");

const debtSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lender: {
    type: String,
    required: true,
  },
  originalAmount: {
    type: Number,
    required: true,
  },
  outstandingBalance: {
    type: Number,
    required: true,
  },
  interestRate: {
    type: Number, // Annual interest rate in percentage (e.g., 5 for 5%)
    required: true,
  },
  monthlyPayment: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  currency: {
    type: String,
    default: "INR",
    required: true,
  },
});

module.exports = mongoose.model("Debt", debtSchema);
