const express = require("express");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public Routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected Route
router.get("/getprofile", authMiddleware, getProfile);

module.exports = router;