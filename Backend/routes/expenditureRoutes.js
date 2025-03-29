const express = require("express");
const Expenditure = require("../models/Expenditure");
const  authMiddleware  = require("../middleware/authMiddleware");

const router = express.Router();

// Save expenditure
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { expenses } = req.body;
    const newExpenditure = new Expenditure({
      user: req.user.id,
      expenses,
    });
    await newExpenditure.save();
    res.json(newExpenditure);
  } catch (error) {
    res.status(400).json({ error: "Error saving expenditure", details: error.message });
  }
});

module.exports = router;