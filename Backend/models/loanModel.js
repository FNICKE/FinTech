// loanModel.js
const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  loanType: {
    type: String,
    required: true,
    enum: ['personal', 'student', 'mortgage', 'auto'],
  },
  loanAmount: {
    type: Number,
    required: true,
  },
  interestRate: {
    type: Number,
    required: true,
  },
  termLength: {
    type: Number, // In months
    required: true,
  },
  currentBalance: {
    type: Number,
    required: true,
  },
  monthlyPayment: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Loan', loanSchema);
