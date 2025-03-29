const IsolationForest = require("isolation-forest");
const Transaction = require("../models/Transaction");

const calculateZScore = (value, mean, stdDev) => {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
};

const detectAnomalies = async (userId, newTransactions) => {
  try {
    const historicalTransactions = await Transaction.find({
      user: userId,
    }).lean();

    if (historicalTransactions.length < 5) {
      console.log(
        "Not enough historical transactions for anomaly detection:",
        historicalTransactions.length
      );
      return newTransactions.map((txn) => ({ ...txn, isSuspicious: false }));
    }

    const categories = [
      "Food",
      "Transport",
      "Housing",
      "Entertainment",
      "Others",
    ];
    const data = historicalTransactions.concat(newTransactions).map((txn) => {
      const categoryVector = categories.map((cat) =>
        cat === txn.category ? 1 : 0
      );
      return [txn.amount, ...categoryVector];
    });

    const forest = new IsolationForest({
      n_trees: 50,
      sample_size: Math.min(256, data.length),
      contamination: 0.2, // Increased to 0.2 for more sensitivity
    });

    await forest.fit(data);

    const scores = forest.score(data);
    const threshold = forest.threshold;

    console.log("All transaction scores:", scores);
    console.log("Anomaly threshold:", threshold);

    const anomalyResults = scores
      .slice(-newTransactions.length)
      .map((score) => score < threshold);

    console.log(
      "Scores for new transactions:",
      scores.slice(-newTransactions.length)
    );
    console.log("Anomaly results for new transactions:", anomalyResults);

    return newTransactions.map((txn, index) => ({
      ...txn,
      isSuspicious: anomalyResults[index],
    }));
  } catch (error) {
    console.error("Error in anomaly detection:", error);
    return newTransactions.map((txn) => ({ ...txn, isSuspicious: false }));
  }
};

const analyzeBehavior = async (userId, newTransactions) => {
  try {
    const historicalTransactions = await Transaction.find({
      user: userId,
    }).lean();

    if (historicalTransactions.length < 5) {
      console.log(
        "Not enough historical transactions for behavioral analysis:",
        historicalTransactions.length
      );
      return newTransactions.map((txn) => {
        const behaviorFlag = txn.amount > 1000;
        console.log(
          `Fallback rule - Category: ${txn.category}, Amount: ${txn.amount}, Behavior Flag: ${behaviorFlag}`
        );
        return { ...txn, behaviorFlag };
      });
    }

    const categoryStats = {};
    historicalTransactions.forEach((txn) => {
      if (!categoryStats[txn.category]) {
        categoryStats[txn.category] = { amounts: [], count: 0 };
      }
      categoryStats[txn.category].amounts.push(txn.amount);
      categoryStats[txn.category].count += 1;
    });

    for (const category in categoryStats) {
      const amounts = categoryStats[category].amounts;
      const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
      const variance =
        amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        amounts.length;
      const stdDev = Math.sqrt(variance);
      categoryStats[category].mean = mean;
      categoryStats[category].stdDev = stdDev;
    }

    return newTransactions.map((txn) => {
      const stats = categoryStats[txn.category] || { mean: 0, stdDev: 0 };
      const zScore = calculateZScore(txn.amount, stats.mean, stats.stdDev);
      const behaviorFlag =
        Math.abs(zScore) > 3 || (stats.mean === 0 && txn.amount > 1000);
      console.log(
        `Category: ${txn.category}, Amount: ${txn.amount}, Mean: ${stats.mean}, StdDev: ${stats.stdDev}, Z-score: ${zScore}, Behavior Flag: ${behaviorFlag}`
      );
      return { ...txn, behaviorFlag };
    });
  } catch (error) {
    console.error("Error in behavioral analysis:", error);
    return newTransactions.map((txn) => ({ ...txn, behaviorFlag: false }));
  }
};

module.exports = { detectAnomalies, analyzeBehavior };
