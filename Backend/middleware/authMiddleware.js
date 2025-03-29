const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    console.log("Auth Middleware: Starting authentication");

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.error("Auth Middleware: No token provided");
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    console.log("Auth Middleware: Token present, verifying...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Auth Middleware: Token decoded", decoded);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.error("Auth Middleware: User not found");
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    console.log("Auth Middleware: Authentication successful");
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({
      error: "Authentication failed",
      details: error.message,
    });
  }
};

module.exports = authMiddleware;
