const express = require("express");
const Income = require("../models/Income"); // Ensure this path is correct
const LockStatus = require("../models/LockStatus");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Add Income
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { amount, source, description, bankAccount } = req.body;
    const lockStatus = await LockStatus.findOne({ user: req.user.id });
    if (lockStatus && lockStatus.isLocked) {
      return res.status(403).json({ error: "Income is locked for this month" });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }
    if (!bankAccount) {
      return res.status(400).json({ error: "Bank account is required" });
    }
    const newIncome = new Income({
      user: req.user.id,
      amount,
      source,
      description,
      bankAccount,
    });
    await newIncome.save();
    res.status(201).json({ message: "Income added successfully", income: newIncome });
  } catch (error) {
    console.error("Error adding income:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get User's Income
router.get("/", authMiddleware, async (req, res) => {
  try {
    const incomeRecords = await Income.find({ user: req.user.id })
      .populate("bankAccount")
      .sort({ date: -1 });
    res.json({ income: incomeRecords });
  } catch (error) {
    console.error("Error fetching income:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Reset Income History
router.post("/reset", authMiddleware, async (req, res) => {
  try {
    await Income.deleteMany({ user: req.user.id });
    res.json({ message: "Income history reset successfully" });
  } catch (error) {
    console.error("Error resetting income history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get Total Income
router.get("/total", authMiddleware, async (req, res) => {
  try {
    const incomeList = await Income.find({ user: req.user.id });
    const totalIncome = incomeList.reduce((sum, inc) => sum + inc.amount, 0);
    res.json({ totalIncome });
  } catch (error) {
    console.error("Error fetching total income:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;