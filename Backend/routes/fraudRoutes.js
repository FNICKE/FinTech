const express = require("express");
const  authMiddleware  = require("../middleware/authMiddleware");

const router = express.Router();

// Get Fraud Alerts
router.get("/alerts", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id });

    // Calculate average spending per category
    const categoryTotals = {};
    const categoryCounts = {};
    expenses.forEach((exp) => {
      categoryTotals[exp.category] =
        (categoryTotals[exp.category] || 0) + exp.amount;
      categoryCounts[exp.category] = (categoryCounts[exp.category] || 0) + 1;
    });
    const categoryAverages = {};
    for (const cat in categoryTotals) {
      categoryAverages[cat] = categoryTotals[cat] / categoryCounts[cat];
    }

    // Simple fraud detection rules
    const alerts = expenses
      .map((exp) => {
        const avg = categoryAverages[exp.category] || 0;
        const isHighAmount = exp.amount > 10000; // Threshold: ₹10,000
        const isUnusual = exp.amount > avg * 2; // 2x the category average
        if (isHighAmount || isUnusual) {
          return {
            id: exp._id,
            date: exp.date,
            description: exp.description,
            category: exp.category,
            amount: exp.amount,
            reason: isHighAmount
              ? "High transaction amount"
              : "Unusual spending pattern",
          };
        }
        return null;
      })
      .filter((alert) => alert !== null);

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: "Error detecting fraud" });
  }
});

module.exports = router;
