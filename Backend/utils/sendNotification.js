const nodemailer = require("nodemailer");

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com", // Replace with your email
    pass: "your-app-password", // Replace with your app-specific password
  },
});

// Function to send an email notification
const sendNotification = async (userEmail, messageData) => {
  try {
    let mailOptions;
    if (messageData.description.includes("Budget Exceed Alert")) {
      // Handle budget exceed notification
      mailOptions = {
        from: "your-email@gmail.com",
        to: userEmail,
        subject: "Budget Exceed Alert",
        text: `Dear User,\n\nWe detected that you've exceeded your budget:\n- Category: ${
          messageData.description
        }\n- Amount Spent: ₹${messageData.amount.toFixed(
          2
        )}\n- Date: ${new Date(
          messageData.date
        ).toLocaleDateString()}\n\nPlease review your spending in your account and adjust your budget if needed.\n\nBest,\nYour Finance App Team`,
      };
    } else {
      // Handle suspicious transaction notification
      mailOptions = {
        from: "your-email@gmail.com",
        to: userEmail,
        subject: "Suspicious Transaction Alert",
        text: `Dear User,\n\nWe detected a potentially suspicious transaction:\n- Description: ${
          messageData.description
        }\n- Amount: ₹${messageData.amount.toFixed(2)}\n- Date: ${new Date(
          messageData.date
        ).toLocaleDateString()}\n\nPlease review this transaction in your account. If this was not you, contact support immediately.\n\nBest,\nYour Finance App Team`,
      };
    }

    await transporter.sendMail(mailOptions);
    console.log(`Notification sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

module.exports = { sendNotification };
