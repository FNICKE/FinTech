const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const taxRoutes = require("./routes/taxRoutes");
const fraudRoutes = require("./routes/fraudRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const bankAccountRoutes = require("./routes/bankAccountRoutes");
const expenditureRoutes = require("./routes/expenditureRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const loanRoutes = require("./routes/loan");
const financialHealthRoutes = require("./routes/financialhealthroyes");
const incomeRoutes = require("./routes/incomeRoutes");
const chatRoutes = require("./routes/chat");
const insightsRoutes = require("./routes/insightsRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const debtRoutes = require("./routes/debtRoutes");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);
app.use("/api/tax", taxRoutes);
app.use("/api/fraud", fraudRoutes);
app.use("/api", loanRoutes);
app.use("/api/financial-health", financialHealthRoutes);
app.use("/api/expenses", transactionRoutes);
app.use("/api/bank-accounts", bankAccountRoutes);
app.use("/api/expenditures", expenditureRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/debts", debtRoutes);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
