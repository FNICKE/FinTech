const IsolationForest = require("isolation-forest");
const Transaction = require("../models/Transaction");

// Function to preprocess transaction data for the Isolation Forest
const preprocessTransactions = (transactions) => {
  return transactions.map((txn) => [
    txn.amount, // Feature 1: Transaction amount
    new Date(txn.date).getTime(), // Feature 2: Timestamp
    // Add more features if needed (e.g., category encoded as a number)
  ]);
};

// Function to detect anomalies in transactions
const detectAnomalies = async (userId) => {
  try {
    // Fetch user's transaction history (last 100 transactions for efficiency)
    const transactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(100);

    if (transactions.length < 10) {
      console.log("Not enough transactions for anomaly detection.");
      return [];
    }

    // Preprocess transactions for the Isolation Forest
    const data = preprocessTransactions(transactions);

    // Initialize and train the Isolation Forest
    const forest = new IsolationForest({
      nTrees: 100,
      sampleSize: 256,
    });
    forest.fit(data);

    // Calculate anomaly scores
    const scores = forest.scores(data);

    // Flag transactions with high anomaly scores
    const threshold = 0.6; // Adjust based on testing
    const suspiciousTransactions = [];

    for (let i = 0; i < transactions.length; i++) {
      const score = scores[i];
      const isSuspicious = score > threshold;

      // Update the transaction in the database
      transactions[i].anomalyScore = score;
      transactions[i].isSuspicious = isSuspicious;
      await transactions[i].save();

      if (isSuspicious) {
        suspiciousTransactions.push(transactions[i]);
      }
    }

    return suspiciousTransactions;
  } catch (error) {
    console.error("Error detecting anomalies:", error);
    return [];
  }
};

module.exports = { detectAnomalies };
