const express = require("express");
const BankAccount = require("../models/BankAccount");
const Transaction = require("../models/Transaction");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Stock = require("../models/Stock"); // Import the new Stock model
const  authMiddleware  = require("../middleware/authMiddleware");
const { detectAnomalies, analyzeBehavior } = require("../utils/fraudDetection");
const nodemailer = require("nodemailer");

const router = express.Router();

// Email transporter setup using Ethereal
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "your-ethereal-user", // Replace with your Ethereal email
    pass: "your-ethereal-pass", // Replace with your Ethereal password
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter verification failed:", error);
  } else {
    console.log("Email transporter is ready to send emails");
  }
});

// Get all bank accounts for the user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const accounts = await BankAccount.find({ user: req.user.id });
    res.json(accounts);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching accounts", details: error.message });
  }
});

// Add a new bank account
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { name, type, balance, income } = req.body;
    const newAccount = new BankAccount({
      user: req.user.id,
      name,
      type,
      balance: parseFloat(balance),
      income: parseFloat(income) || 0,
      lastSynced: new Date().toISOString(),
      status: "Connected",
    });
    await newAccount.save();
    res.json(newAccount);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error adding account", details: error.message });
  }
});

// Add money to an existing bank account
router.post("/add-money", authMiddleware, async (req, res) => {
  try {
    const { bankAccountId, amount } = req.body;
    const amountToAdd = parseFloat(amount);

    if (isNaN(amountToAdd) || amountToAdd <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const account = await BankAccount.findOne({
      _id: bankAccountId,
      user: req.user.id,
    });
    if (!account) {
      return res.status(404).json({ error: "Bank account not found" });
    }

    account.balance += amountToAdd;
    account.lastSynced = new Date().toISOString();
    await account.save();

    const transaction = new Transaction({
      user: req.user.id,
      bankAccount: bankAccountId,
      description: "Deposit",
      category: "Deposit",
      amount: amountToAdd,
      date: new Date(),
    });

    let transactions = [transaction];
    transactions = await detectAnomalies(req.user.id, transactions);
    transactions = await analyzeBehavior(req.user.id, transactions);

    const savedTransaction = await transaction.save();

    const user = await User.findById(req.user.id);
    if (!user || !user.email) {
      console.error("User email not found for user ID:", req.user.id);
      return res.status(400).json({ error: "User email not found" });
    }
    const userEmail = user.email;

    const notifications = [];
    if (savedTransaction.isSuspicious) {
      const message = `Suspicious deposit detected: Deposit (₹${savedTransaction.amount})`;
      notifications.push({
        user: req.user.id,
        message,
        type: "anomaly",
        transaction: savedTransaction._id,
      });

      await transporter
        .sendMail({
          from: "your-ethereal-user",
          to: userEmail,
          subject: "Suspicious Deposit Alert",
          text: `A suspicious deposit was detected: Deposit (₹${
            savedTransaction.amount
          }) on ${new Date(
            savedTransaction.date
          ).toLocaleDateString()}. Please review your account activity.`,
        })
        .catch((error) => {
          console.error(
            `Error sending email for suspicious deposit (ID: ${savedTransaction._id}):`,
            error
          );
        });
    }

    if (transactions[0].behaviorFlag) {
      const message = `Unusual deposit behavior detected: Deposit (₹${savedTransaction.amount}) exceeds your typical deposits`;
      notifications.push({
        user: req.user.id,
        message,
        type: "behavior",
        transaction: savedTransaction._id,
      });

      await transporter
        .sendMail({
          from: "your-ethereal-user",
          to: userEmail,
          subject: "Unusual Deposit Behavior Alert",
          text: `Unusual deposit detected: Deposit (₹${
            savedTransaction.amount
          }) on ${new Date(
            savedTransaction.date
          ).toLocaleDateString()} exceeds your typical deposits. Please review your account activity.`,
        })
        .catch((error) => {
          console.error(
            `Error sending email for unusual deposit behavior (ID: ${savedTransaction._id}):`,
            error
          );
        });
    }

    if (notifications.length > 0) {
      console.log("Notifications created for deposit:", notifications);
      await Notification.insertMany(notifications);
    }

    res.json({ message: "Amount added successfully", updatedAccount: account });
  } catch (error) {
    console.error("Error in /add-money endpoint:", error);
    res
      .status(500)
      .json({ error: "Error adding money", details: error.message });
  }
});

// Buy a stock and deduct the amount from the selected bank account
router.post("/buy-stock", authMiddleware, async (req, res) => {
  try {
    const { bankAccountId, stockSymbol, stockName, amount } = req.body;
    const purchaseAmount = parseFloat(amount);

    if (isNaN(purchaseAmount) || purchaseAmount <= 0) {
      return res.status(400).json({ error: "Invalid purchase amount" });
    }

    const account = await BankAccount.findOne({
      _id: bankAccountId,
      user: req.user.id,
    });
    if (!account) {
      return res.status(404).json({ error: "Bank account not found" });
    }

    if (account.balance < purchaseAmount) {
      return res
        .status(400)
        .json({ error: "Insufficient balance in selected account" });
    }

    // Deduct the amount from the bank account
    account.balance -= purchaseAmount;
    account.lastSynced = new Date().toISOString();
    await account.save();

    // Record the stock purchase as a transaction
    const transaction = new Transaction({
      user: req.user.id,
      bankAccount: bankAccountId,
      description: `Stock Purchase: ${stockName} (${stockSymbol})`,
      category: "Stock Purchase",
      amount: purchaseAmount,
      date: new Date(),
    });

    // Run anomaly detection on the transaction
    let transactions = [transaction];
    transactions = await detectAnomalies(req.user.id, transactions);
    transactions = await analyzeBehavior(req.user.id, transactions);

    const savedTransaction = await transaction.save();

    // Save the stock purchase to the stocks collection
    const stock = new Stock({
      user: req.user.id,
      symbol: stockSymbol,
      name: stockName,
      purchasePrice: purchaseAmount,
      quantity: 1, // Hardcoded for now; can add quantity selection later
    });
    await stock.save();

    // Fetch the user's email
    const user = await User.findById(req.user.id);
    if (!user || !user.email) {
      console.error("User email not found for user ID:", req.user.id);
      return res.status(400).json({ error: "User email not found" });
    }
    const userEmail = user.email;

    // Create notifications for suspicious transactions
    const notifications = [];
    if (savedTransaction.isSuspicious) {
      const message = `Suspicious transaction detected: Stock Purchase: ${stockName} (${stockSymbol}) (₹${savedTransaction.amount})`;
      notifications.push({
        user: req.user.id,
        message,
        type: "anomaly",
        transaction: savedTransaction._id,
      });

      await transporter
        .sendMail({
          from: "your-ethereal-user",
          to: userEmail,
          subject: "Suspicious Stock Purchase Alert",
          text: `A suspicious transaction was detected: Stock Purchase: ${stockName} (${stockSymbol}) (₹${
            savedTransaction.amount
          }) on ${new Date(
            savedTransaction.date
          ).toLocaleDateString()}. Please review your account activity.`,
        })
        .catch((error) => {
          console.error(
            `Error sending email for suspicious stock purchase (ID: ${savedTransaction._id}):`,
            error
          );
        });
    }

    if (transactions[0].behaviorFlag) {
      const message = `Unusual spending behavior detected: Stock Purchase: ${stockName} (${stockSymbol}) (₹${savedTransaction.amount}) exceeds your typical spending for Stock Purchase`;
      notifications.push({
        user: req.user.id,
        message,
        type: "behavior",
        transaction: savedTransaction._id,
      });

      await transporter
        .sendMail({
          from: "your-ethereal-user",
          to: userEmail,
          subject: "Unusual Stock Purchase Behavior Alert",
          text: `Unusual spending detected: Stock Purchase: ${stockName} (${stockSymbol}) (₹${
            savedTransaction.amount
          }) on ${new Date(
            savedTransaction.date
          ).toLocaleDateString()} exceeds your typical spending for Stock Purchase. Please review your account activity.`,
        })
        .catch((error) => {
          console.error(
            `Error sending email for unusual stock purchase behavior (ID: ${savedTransaction._id}):`,
            error
          );
        });
    }

    if (notifications.length > 0) {
      console.log("Notifications created for stock purchase:", notifications);
      await Notification.insertMany(notifications);
    }

    res.json({
      message: "Stock purchased successfully",
      updatedAccount: account,
    });
  } catch (error) {
    console.error("Error in /buy-stock endpoint:", error);
    res
      .status(500)
      .json({ error: "Error purchasing stock", details: error.message });
  }
});

// Delete a bank account and its associated transactions
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const accountId = req.params.id;
    const account = await BankAccount.findOne({
      _id: accountId,
      user: req.user.id,
    });

    if (!account) {
      return res.status(404).json({ error: "Bank account not found" });
    }

    await BankAccount.deleteOne({ _id: accountId });
    await Transaction.deleteMany({ bankAccount: accountId });
    await Notification.deleteMany({
      user: req.user.id,
      transaction: {
        $in: await Transaction.find({ bankAccount: accountId }).distinct("_id"),
      },
    });

    res.json({
      message: "Bank account and associated transactions deleted successfully",
    });
  } catch (error) {
    console.error("Error in /delete endpoint:", error);
    res
      .status(500)
      .json({ error: "Error deleting account", details: error.message });
  }
});

// Deduct amount from a specific bank account and record transactions
router.post("/deduct", authMiddleware, async (req, res) => {
  try {
    const { bankAccountId, expenses } = req.body;
    const totalAmount = Object.values(expenses).reduce(
      (sum, val) => sum + val,
      0
    );

    const account = await BankAccount.findOne({
      _id: bankAccountId,
      user: req.user.id,
    });
    if (!account) {
      return res.status(404).json({ error: "Bank account not found" });
    }

    if (account.balance < totalAmount) {
      return res
        .status(400)
        .json({ error: "Insufficient balance in selected account" });
    }

    account.balance -= totalAmount;
    await account.save();

    let transactions = Object.entries(expenses)
      .filter(([_, amount]) => amount > 0)
      .map(([category, amount]) => ({
        user: req.user.id,
        bankAccount: bankAccountId,
        description: `${category} expense`,
        category,
        amount,
        date: new Date(),
      }));

    transactions = await detectAnomalies(req.user.id, transactions);
    transactions = await analyzeBehavior(req.user.id, transactions);

    console.log("Transactions after analysis:", transactions);

    const savedTransactions = await Transaction.insertMany(
      transactions.map((txn) => ({
        user: txn.user,
        bankAccount: txn.bankAccount,
        description: txn.description,
        category: txn.category,
        amount: txn.amount,
        date: txn.date,
        isSuspicious: txn.isSuspicious,
      }))
    );

    const user = await User.findById(req.user.id);
    if (!user || !user.email) {
      console.error("User email not found for user ID:", req.user.id);
      return res.status(400).json({ error: "User email not found" });
    }
    const userEmail = user.email;

    const notifications = [];
    for (let i = 0; i < savedTransactions.length; i++) {
      const txn = savedTransactions[i];
      const analysis = transactions[i];

      if (txn.isSuspicious) {
        const message = `Suspicious transaction detected: ${txn.description} (₹${txn.amount})`;
        notifications.push({
          user: req.user.id,
          message,
          type: "anomaly",
          transaction: txn._id,
        });

        await transporter
          .sendMail({
            from: "your-ethereal-user",
            to: userEmail,
            subject: "Suspicious Transaction Alert",
            text: `A suspicious transaction was detected: ${
              txn.description
            } (₹${txn.amount}) on ${new Date(
              txn.date
            ).toLocaleDateString()}. Please review your account activity.`,
          })
          .catch((error) => {
            console.error(
              `Error sending email for suspicious transaction (ID: ${txn._id}):`,
              error
            );
          });
      }

      if (analysis.behaviorFlag) {
        const message = `Unusual spending behavior detected: ${txn.description} (₹${txn.amount}) exceeds your typical spending for ${txn.category}`;
        notifications.push({
          user: req.user.id,
          message,
          type: "behavior",
          transaction: txn._id,
        });

        await transporter
          .sendMail({
            from: "your-ethereal-user",
            to: userEmail,
            subject: "Unusual Spending Behavior Alert",
            text: `Unusual spending detected: ${txn.description} (₹${
              txn.amount
            }) on ${new Date(
              txn.date
            ).toLocaleDateString()} exceeds your typical spending for ${
              txn.category
            }. Please review your account activity.`,
          })
          .catch((error) => {
            console.error(
              `Error sending email for unusual behavior (ID: ${txn._id}):`,
              error
            );
          });
      }
    }

    if (notifications.length > 0) {
      console.log("Notifications created:", notifications);
      await Notification.insertMany(notifications);
    } else {
      console.log("No notifications created for this transaction batch");
    }

    res.json({
      message: "Amount deducted and transactions recorded successfully",
    });
  } catch (error) {
    console.error("Error in /deduct endpoint:", error);
    res
      .status(500)
      .json({ error: "Error deducting amount", details: error.message });
  }
});

// Get all purchased stocks for the user
router.get("/stocks", authMiddleware, async (req, res) => {
  try {
    const stocks = await Stock.find({ user: req.user.id });
    res.json(stocks);
  } catch (error) {
    console.error("Error fetching stocks:", error);
    res
      .status(500)
      .json({ error: "Error fetching stocks", details: error.message });
  }
});

module.exports = router;
