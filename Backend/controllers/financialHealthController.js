// financialHealthController.js
const calculateFinancialHealthScore = (income, expenses, totalDebt, dti) => {
    let score = 100;
    if (dti > 0.4) score -= 20;  // High DTI reduces score
    if (expenses > income) score -= 15;  // Overspending reduces score
    if (totalDebt > income * 3) score -= 25;  // High debt increases risk
    if (income > 100000) score += 10;  // High income increases score
    return score;
  };
  
  exports.getFinancialHealthScore = async (req, res) => {
    try {
      const { income, expenses, totalDebt, dti } = req.body;
      const score = calculateFinancialHealthScore(income, expenses, totalDebt, dti);
      res.status(200).json({ score });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };
  