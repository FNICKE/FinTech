const mongoose = require("mongoose");

const expenditureSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expenses: {
    Food: { type: Number, default: 0 },
    Transport: { type: Number, default: 0 },
    Housing: { type: Number, default: 0 },
    Entertainment: { type: Number, default: 0 },
    Others: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Expenditure", expenditureSchema);
