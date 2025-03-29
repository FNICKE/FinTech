const mongoose = require("mongoose");

const LockStatusSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isLocked: { type: Boolean, default: false },
});

module.exports = mongoose.model("LockStatus", LockStatusSchema);
