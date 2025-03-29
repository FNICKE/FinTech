const express = require("express");
const BankAccount = require("../models/BankAccount");
const Transaction = require("../models/Transaction");
const  authMiddleware  = require("../middleware/authMiddleware");
const { convertCurrency } = require("../utils/currencyConverter");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const baseCurrency = "INR"; // Base currency for calculations

    // Fetch all bank accounts
    const bankAccounts = await BankAccount.find({ user: userId });

    if (!bankAccounts.length) {
      return res.status(404).json({ error: "No bank accounts found" });
    }

    const bankAccountIds = bankAccounts.map((account) => account._id);

    // Calculate total balance (assuming balances are in INR)
    const totalBalance = bankAccounts.reduce(
      (sum, account) => sum + (account.balance || 0),
      0
    );

    // Fetch transactions for the past 12 months
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const transactions = await Transaction.find({
      user: userId,
      bankAccount: { $in: bankAccountIds },
      date: { $gte: oneYearAgo },
    });

    // Convert transaction amounts to base currency (INR)
    const convertedTransactions = await Promise.all(
      transactions.map(async (txn) => {
        const amountInBaseCurrency = await convertCurrency(
          txn.amount,
          txn.currency,
          baseCurrency
        );
        return { ...txn._doc, amountInBaseCurrency };
      })
    );

    // Calculate monthly income and expenses for the past 12 months
    const monthlyData = Array(12)
      .fill()
      .map((_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        return {
          month: date.toLocaleString("default", { month: "short" }),
          income: 0,
          expenses: 0,
        };
      });

    convertedTransactions.forEach((txn) => {
      const txnDate = new Date(txn.date);
      const monthIndex =
        (txnDate.getMonth() + (12 - new Date().getMonth())) % 12;
      if (txn.category === "Deposit") {
        monthlyData[monthIndex].income += txn.amountInBaseCurrency;
      } else {
        monthlyData[monthIndex].expenses += txn.amountInBaseCurrency;
      }
    });

    // Calculate total monthly income and expenses for the current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthTransactions = convertedTransactions.filter((txn) => {
      const txnDate = new Date(txn.date);
      return (
        txnDate.getMonth() === currentMonth &&
        txnDate.getFullYear() === currentYear
      );
    });

    const monthlyIncome = currentMonthTransactions
      .filter((txn) => txn.category === "Deposit")
      .reduce((sum, txn) => sum + txn.amountInBaseCurrency, 0);

    const monthlyExpenses = currentMonthTransactions
      .filter((txn) => txn.category !== "Deposit")
      .reduce((sum, txn) => sum + txn.amountInBaseCurrency, 0);

    // Calculate previous month's income and expenses for percentage change
    const previousMonth = new Date();
    previousMonth.setMonth(currentMonth - 1);
    const previousMonthTransactions = convertedTransactions.filter((txn) => {
      const txnDate = new Date(txn.date);
      return (
        txnDate.getMonth() === previousMonth.getMonth() &&
        txnDate.getFullYear() === previousMonth.getFullYear()
      );
    });

    const previousMonthlyIncome = previousMonthTransactions
      .filter((txn) => txn.category === "Deposit")
      .reduce((sum, txn) => sum + txn.amountInBaseCurrency, 0);

    const previousMonthlyExpenses = previousMonthTransactions
      .filter((txn) => txn.category !== "Deposit")
      .reduce((sum, txn) => sum + txn.amountInBaseCurrency, 0);

    const incomeChange = previousMonthlyIncome
      ? ((monthlyIncome - previousMonthlyIncome) / previousMonthlyIncome) * 100
      : 0;
    const expensesChange = previousMonthlyExpenses
      ? ((monthlyExpenses - previousMonthlyExpenses) /
          previousMonthlyExpenses) *
        100
      : 0;
    const balanceChange = previousMonthlyExpenses
      ? ((totalBalance - (previousMonthlyIncome - previousMonthlyExpenses)) /
          (previousMonthlyIncome - previousMonthlyExpenses)) *
        100
      : 0;

    // Calculate savings (total income - total expenses over 12 months)
    const totalIncome = convertedTransactions
      .filter((txn) => txn.category === "Deposit")
      .reduce((sum, txn) => sum + txn.amountInBaseCurrency, 0);
    const totalExpenses = convertedTransactions
      .filter((txn) => txn.category !== "Deposit")
      .reduce((sum, txn) => sum + txn.amountInBaseCurrency, 0);
    const savings = totalIncome - totalExpenses;

    // Fetch the last 5 transactions
    const recentTransactions = await Transaction.find({
      user: userId,
      bankAccount: { $in: bankAccountIds },
    })
      .sort({ date: -1 }) // Sort by date descending
      .limit(5);

    // Convert recent transaction amounts to base currency (INR)
    const convertedRecentTransactions = await Promise.all(
      recentTransactions.map(async (txn) => {
        const amountInBaseCurrency = await convertCurrency(
          txn.amount,
          txn.currency,
          baseCurrency
        );
        return {
          date: txn.date,
          description: txn.description,
          category: txn.category,
          amount: amountInBaseCurrency,
          originalAmount: txn.amount,
          originalCurrency: txn.currency,
        };
      })
    );

    // Generate AI financial insights (mock data for now; implement logic as needed)
    const aiInsights = [
      {
        type: "warning",
        message:
          "You've spent ₹4,516.97 on subscriptions this year. Consider canceling unused subscriptions to save ₹4,516.97 annually.",
      },
      {
        type: "success",
        message:
          "Your freelance income has increased by 15% compared to last month. Keep up the good work!",
      },
      {
        type: "alert",
        message:
          "You've reached 85% of your dining budget this month with 10 days remaining.",
      },
      {
        type: "warning",
        message:
          "Your entertainment spending is 20% higher than your 3-month average.",
      },
    ];

    res.json({
      totalBalance,
      balanceChange,
      monthlyIncome,
      incomeChange,
      monthlyExpenses,
      expensesChange,
      savings,
      monthlyData,
      recentTransactions: convertedRecentTransactions,
      aiInsights,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res
      .status(500)
      .json({ error: "Error fetching dashboard data", details: error.message });
  }
});

module.exports = router;
