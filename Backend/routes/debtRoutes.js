const express = require("express");
const Debt = require("../models/Debt");
const Notification = require("../models/Notification"); // Add this line
const  authMiddleware  = require("../middleware/authMiddleware");
const { convertCurrency } = require("../utils/currencyConverter");

const router = express.Router();

// Get all debts and repayment schedules for the user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const baseCurrency = "INR"; // Base currency for calculations

    // Fetch all debts for the user
    const debts = await Debt.find({ user: userId });

    if (!debts.length) {
      return res
        .status(200)
        .json({ debts: [], totalOutstanding: 0, monthlyRepayment: 0 });
    }

    // Convert debt amounts to base currency (INR)
    const convertedDebts = await Promise.all(
      debts.map(async (debt) => {
        const outstandingBalanceInBaseCurrency = await convertCurrency(
          debt.outstandingBalance,
          debt.currency,
          baseCurrency
        );
        const monthlyPaymentInBaseCurrency = await convertCurrency(
          debt.monthlyPayment,
          debt.currency,
          baseCurrency
        );

        // Calculate repayment schedule
        const repaymentSchedule = [];
        let remainingBalance = debt.outstandingBalance;
        let currentDate = new Date(debt.startDate);
        const monthlyInterestRate = debt.interestRate / 100 / 12; // Monthly interest rate

        while (remainingBalance > 0 && currentDate <= new Date(debt.dueDate)) {
          const interestForMonth = remainingBalance * monthlyInterestRate;
          const principalPayment = debt.monthlyPayment - interestForMonth;
          remainingBalance = remainingBalance - principalPayment;

          if (remainingBalance < 0) remainingBalance = 0;

          repaymentSchedule.push({
            date: new Date(currentDate),
            paymentAmount: debt.monthlyPayment,
            interest: interestForMonth,
            principal: principalPayment,
            remainingBalance: remainingBalance > 0 ? remainingBalance : 0,
          });

          currentDate.setMonth(currentDate.getMonth() + 1);
        }

        return {
          ...debt._doc,
          outstandingBalanceInBaseCurrency,
          monthlyPaymentInBaseCurrency,
          repaymentSchedule,
        };
      })
    );

    // Calculate total outstanding debt and monthly repayment
    const totalOutstanding = convertedDebts.reduce(
      (sum, debt) => sum + debt.outstandingBalanceInBaseCurrency,
      0
    );
    const monthlyRepayment = convertedDebts.reduce(
      (sum, debt) => sum + debt.monthlyPaymentInBaseCurrency,
      0
    );

    res.json({
      debts: convertedDebts,
      totalOutstanding,
      monthlyRepayment,
    });
  } catch (error) {
    console.error("Error fetching debts:", error);
    res
      .status(500)
      .json({ error: "Error fetching debts", details: error.message });
  }
});

// Add a new debt
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      lender,
      originalAmount,
      outstandingBalance,
      interestRate,
      monthlyPayment,
      startDate,
      dueDate,
      currency,
    } = req.body;

    const newDebt = new Debt({
      user: userId,
      lender,
      originalAmount,
      outstandingBalance,
      interestRate,
      monthlyPayment,
      startDate,
      dueDate,
      currency: currency || "INR",
    });

    await newDebt.save();

    // Generate notifications for upcoming payments
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7); // Look for payments due in the next 7 days

    let currentDate = new Date(newDebt.startDate);
    while (currentDate <= new Date(newDebt.dueDate)) {
      if (currentDate >= today && currentDate <= nextWeek) {
        const notification = new Notification({
          user: userId,
          type: "debt-reminder",
          message: `Upcoming payment of ${newDebt.monthlyPayment} ${
            newDebt.currency
          } for your debt with ${newDebt.lender} is due on ${
            currentDate.toISOString().split("T")[0]
          }.`,
          debt: newDebt._id,
          date: currentDate,
        });
        await notification.save();
      }
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    res.status(201).json({ message: "Debt added successfully", debt: newDebt });
  } catch (error) {
    console.error("Error adding debt:", error);
    res
      .status(500)
      .json({ error: "Error adding debt", details: error.message });
  }
});

module.exports = router;
