const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: String,
    required: true, // e.g., "Housing", "Food", "Stock Purchase"
  },
  amount: {
    type: Number,
    required: true, // Budget amount in INR
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Budget", budgetSchema);
