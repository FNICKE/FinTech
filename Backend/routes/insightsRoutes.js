const express = require("express");
const BankAccount = require("../models/BankAccount");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Notification = require("../models/Notification");
const User = require("../models/User"); // Add this line to fetch user email
const { sendNotification } = require("../utils/sendNotification"); // Add this line
const  authMiddleware  = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/spending", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const bankAccountId = req.query.bankAccountId;

    const bankAccounts = bankAccountId
      ? await BankAccount.find({ _id: bankAccountId, user: userId })
      : await BankAccount.find({ user: userId });

    if (!bankAccounts.length) {
      return res.status(404).json({ error: "No bank accounts found" });
    }

    const bankAccountIds = bankAccounts.map((account) => account._id);
    const transactions = await Transaction.find({
      user: userId,
      bankAccount: { $in: bankAccountIds },
      category: { $ne: "Deposit" },
    });

    const totalIncome = bankAccounts.reduce((sum, account) => {
      return sum + (account.income || 0) * 12;
    }, 0);

    const spendingByCategory = transactions.reduce((acc, txn) => {
      if (txn.amount && typeof txn.amount === "number") {
        acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
      }
      return acc;
    }, {});

    const totalSpending =
      Object.values(spendingByCategory).reduce(
        (sum, amount) => sum + amount,
        0
      ) || 0;

    const budgets = await Budget.find({ user: userId });
    const budgetByCategory = budgets.reduce((acc, budget) => {
      acc[budget.category] = budget.amount;
      return acc;
    }, {});

    // Fetch the user to get their email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const insights = [];
    for (const [category, amount] of Object.entries(spendingByCategory)) {
      const budget = budgetByCategory[category] || 0;
      const percentageOfIncome =
        totalIncome > 0 ? (amount / totalIncome) * 100 : 0;

      if (budget > 0 && amount > budget) {
        const message = `You're overspending on ${category}. You've spent ₹${amount.toFixed(
          2
        )} against a budget of ₹${budget.toFixed(
          2
        )}. Consider reducing your spending in this category.`;
        insights.push({
          category,
          message,
          severity: "warning",
        });

        // Save the budget exceed alert as a notification
        const notification = new Notification({
          user: userId,
          message,
          type: "budget_exceed",
          category,
        });
        await notification.save();

        // Send an email notification
        const emailMessage = {
          description: `Budget Exceed Alert for ${category}`,
          amount,
          date: new Date(),
        };
        await sendNotification(user.email, emailMessage);
      } else if (percentageOfIncome > 30) {
        insights.push({
          category,
          message: `${category} accounts for ${percentageOfIncome.toFixed(
            2
          )}% of your income, which is high. Consider setting a budget to control spending.`,
          severity: "info",
        });
      } else if (budget > 0 && amount <= budget) {
        insights.push({
          category,
          message: `Good job! You're within your budget for ${category}, spending ₹${amount.toFixed(
            2
          )} against a budget of ₹${budget.toFixed(2)}.`,
          severity: "success",
        });
      }
    }

    if (insights.length === 0) {
      insights.push({
        category: "General",
        message:
          "Your spending looks balanced. Consider setting budgets for each category to better manage your finances.",
        severity: "info",
      });
    }

    res.json({
      spendingByCategory,
      totalSpending,
      totalIncome,
      insights,
    });
  } catch (error) {
    console.error("Error analyzing spending patterns:", error);
    res.status(500).json({
      error: "Error analyzing spending patterns",
      details: error.message,
    });
  }
});

// Use the existing notification endpoints
router.get("/notifications", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ user: userId }).sort({
      date: -1,
    });
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res
      .status(500)
      .json({ error: "Error fetching notifications", details: error.message });
  }
});

router.put("/notifications/:id/read", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
    });
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      error: "Error marking notification as read",
      details: error.message,
    });
  }
});

// Rest of the routes (budget, budgets) remain unchanged
router.get("/budget", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const bankAccountId = req.query.bankAccountId;

    const bankAccounts = bankAccountId
      ? await BankAccount.find({ _id: bankAccountId, user: userId })
      : await BankAccount.find({ user: userId });

    if (!bankAccounts.length) {
      return res.status(404).json({ error: "No bank accounts found" });
    }

    const bankAccountIds = bankAccounts.map((account) => account._id);
    const transactions = await Transaction.find({
      user: userId,
      bankAccount: { $in: bankAccountIds },
      category: { $ne: "Deposit" },
    });

    const totalIncome = bankAccounts.reduce((sum, account) => {
      return sum + (account.income || 0) * 12;
    }, 0);

    const spendingByCategory = transactions.reduce((acc, txn) => {
      if (txn.amount && typeof txn.amount === "number") {
        acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
      }
      return acc;
    }, {});

    const budgetRecommendations = {};
    const needsCategories = ["Housing", "Food", "Utilities"];
    const wantsCategories = ["Entertainment", "Shopping"];
    const savingsCategories = ["Stock Purchase", "Savings"];

    const totalNeeds = needsCategories.reduce(
      (sum, cat) => sum + (spendingByCategory[cat] || 0),
      0
    );
    const totalWants = wantsCategories.reduce(
      (sum, cat) => sum + (spendingByCategory[cat] || 0),
      0
    );
    const totalSavings = savingsCategories.reduce(
      (sum, cat) => sum + (spendingByCategory[cat] || 0),
      0
    );

    const recommendedNeeds = totalIncome * 0.5;
    const recommendedWants = totalIncome * 0.3;
    const recommendedSavings = totalIncome * 0.2;

    for (const [category, amount] of Object.entries(spendingByCategory)) {
      let recommendedAmount;
      if (needsCategories.includes(category)) {
        recommendedAmount =
          totalNeeds > 0 ? (amount / totalNeeds) * recommendedNeeds : 0;
      } else if (wantsCategories.includes(category)) {
        recommendedAmount =
          totalWants > 0 ? (amount / totalWants) * recommendedWants : 0;
      } else if (savingsCategories.includes(category)) {
        recommendedAmount =
          totalSavings > 0 ? (amount / totalSavings) * recommendedSavings : 0;
      } else {
        recommendedAmount = amount * 0.8;
      }
      budgetRecommendations[category] = Math.max(recommendedAmount, 1000);
    }

    res.json({
      budgetRecommendations,
      totalIncome,
      recommendedNeeds,
      recommendedWants,
      recommendedSavings,
    });
  } catch (error) {
    console.error("Error generating budget recommendations:", error);
    res.status(500).json({
      error: "Error generating budget recommendations",
      details: error.message,
    });
  }
});

router.get("/budgets", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const budgets = await Budget.find({ user: userId });
    res.json(budgets);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res
      .status(500)
      .json({ error: "Error fetching budgets", details: error.message });
  }
});

router.post("/budgets", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, amount } = req.body;

    if (!category || !amount || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Category and a valid amount are required" });
    }

    let budget = await Budget.findOne({ user: userId, category });
    if (budget) {
      budget.amount = amount;
      await budget.save();
    } else {
      budget = new Budget({
        user: userId,
        category,
        amount,
      });
      await budget.save();
    }

    res.json(budget);
  } catch (error) {
    console.error("Error setting budget:", error);
    res
      .status(500)
      .json({ error: "Error setting budget", details: error.message });
  }
});

module.exports = router;
