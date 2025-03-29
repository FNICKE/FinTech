// loanController.js
const Loan = require('../models/loanModel');

// Endpoint to get loans of a user
exports.getLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.id });
    res.status(200).json(loans);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Endpoint to calculate debt-to-income ratio (DTI)
exports.calculateDTI = async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.id });
    let totalDebt = 0;
    loans.forEach((loan) => {
      totalDebt += loan.currentBalance;
    });
    
    const income = req.body.income;  // Assume income is sent in the request body
    const dti = totalDebt / income;
    
    res.status(200).json({ dti });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Endpoint to optimize loans (For example, suggest paying off the highest-interest loan first)
exports.optimizeLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.id });
    
    // Sort loans by interest rate in descending order
    const optimizedLoans = loans.sort((a, b) => b.interestRate - a.interestRate);
    
    res.status(200).json({ optimizedLoans });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
