const express = require("express");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all transactions for the user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).populate("bankAccount");
    console.log("Fetched transactions for user", req.user.id, ":", transactions.map(txn => ({ _id: txn._id, amount: txn.amount, type: txn.type, bankAccount: txn.bankAccount?._id || txn.bankAccount })));
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    res.status(500).json({ error: "Error fetching transactions", details: error.message });
  }
});

// Add a transaction (income or expense)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { amount, category, bankAccount, source, description, type } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }
    if (!bankAccount) {
      return res.status(400).json({ error: "Bank account is required" });
    }
    if (!type || !["income", "expense"].includes(type)) {
      return res.status(400).json({ error: "Type must be 'income' or 'expense'" });
    }
    if (type === "expense" && !category) {
      return res.status(400).json({ error: "Category is required for expenses" });
    }

    const transaction = new Transaction({
      user: req.user.id,
      amount,
      category,
      bankAccount,
      source,
      description,
      type,
    });
    await transaction.save();
    console.log("Added transaction:", { _id: transaction._id, amount, type, bankAccount });
    res.status(201).json(transaction);
  } catch (error) {
    console.error("Error adding transaction:", error.message);
    res.status(500).json({ error: "Error adding transaction", details: error.message });
  }
});

// Get suspicious transactions for the user
router.get("/suspicious", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id,
      isSuspicious: true,
    }).populate("bankAccount");
    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching suspicious transactions",
      details: error.message,
    });
  }
});

// Update transaction status (mark as safe or report as fraud)
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { isSuspicious, alerted } = req.body;
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    transaction.isSuspicious = isSuspicious;
    transaction.alerted = alerted;
    await transaction.save();

    res.json({ message: "Transaction updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating transaction", details: error.message });
  }
});

// Delete a transaction
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    console.log("Deleted transaction:", transaction._id);
    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error.message);
    res.status(500).json({ error: "Error deleting transaction", details: error.message });
  }
});

module.exports = router;