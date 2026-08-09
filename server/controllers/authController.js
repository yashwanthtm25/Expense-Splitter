const User = require("../models/User");
const bcrypt = require("bcrypt");

const generateToken = require("../utils/generateToken");
const generateResetToken = require("../utils/generateResetToken");
const sendEmail = require("../utils/sendEmail");

// ======================
// Register User
// ======================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Registration Successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================
// Login User
// ======================
exports.login = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    res.status(200).json({
      message: "Login Successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// ======================
// Forgot Password
// ======================
exports.forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    // Don't reveal whether email exists
    if (!user) {
      return res.status(200).json({
        message:
          "If the email is registered, a reset link has been sent.",
      });
    }

    const resetToken = generateResetToken();

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const html = `
        <h2>Password Reset Request</h2>

        <p>You requested a password reset.</p>

        <p>
            <a href="${resetLink}">
                Reset Password
            </a>
        </p>

        <p>This link expires in <b>15 minutes</b>.</p>

        <p>Please do not share this link.</p>

        <p>If you did not request this, simply ignore this email.</p>
    `;

    await sendEmail(
      user.email,
      "Password Reset",
      html
    );

    res.status(200).json({
      message: "Password reset email sent",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// ======================
// Reset Password
// ======================
exports.resetPassword = async (req, res) => {

  try {

    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or Expired Token",
      });
    }

    user.password = await bcrypt.hash(password, 10);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// ======================
// Protected Route
// ======================
exports.getProfile = async (req, res) => {
  try {
    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};