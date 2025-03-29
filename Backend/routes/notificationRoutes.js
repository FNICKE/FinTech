const express = require("express");
const Notification = require("../models/Notification");
const Debt = require("../models/Debt"); // Add this line
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

console.log("Notification Routes: Router created", router); // Debug log

// Get all notifications for the user
router.get("/", authMiddleware, async (req, res) => {
  console.log("Notification GET route handler called"); // Debug log
  try {
    const userId = req.user.id;

    // Fetch existing notifications
    let notifications = await Notification.find({ user: userId })
      .populate("transaction")
      .populate("debt")
      .sort({ date: -1 });

    // Generate debt payment reminders if they don't already exist
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7); // Look for payments due in the next 7 days

    const debts = await Debt.find({ user: userId });

    for (const debt of debts) {
      let currentDate = new Date(debt.startDate);
      while (currentDate <= new Date(debt.dueDate)) {
        if (currentDate >= today && currentDate <= nextWeek) {
          // Check if a notification for this payment already exists
          const existingNotification = notifications.find(
            (notif) =>
              notif.type === "debt-reminder" &&
              notif.debt.toString() === debt._id.toString() &&
              new Date(notif.date).toISOString().split("T")[0] ===
                currentDate.toISOString().split("T")[0]
          );

          if (!existingNotification) {
            const notification = new Notification({
              user: userId,
              type: "debt-reminder",
              message: `Upcoming payment of ${debt.monthlyPayment} ${
                debt.currency
              } for your debt with ${debt.lender} is due on ${
                currentDate.toISOString().split("T")[0]
              }.`,
              debt: debt._id,
              date: currentDate,
            });
            await notification.save();
            notifications.push(notification);
          }
        }
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    // Sort notifications by date
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(notifications);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching notifications", details: error.message });
  }
});

// Mark a notification as read
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({
      error: "Error marking notification as read",
      details: error.message,
    });
  }
});

console.log("Notification Routes: Module exports", router); // Debug log
module.exports = router;
