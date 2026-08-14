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
    <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
        <h2 style="margin: 0 0 16px; font-size: 20px;">Password Reset Request</h2>

        <p style="margin: 0 0 20px; line-height: 1.5;">
            We received a request to reset your password. Click the button below to choose a new one.
        </p>

        <p style="margin: 0 0 24px;">
            <a href="${resetLink}"
               style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
                Reset Password
            </a>
        </p>

        <p style="margin: 0 0 12px; font-size: 14px; color: #555;">
            Or copy and paste this link into your browser:<br>
            <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
        </p>

        <p style="margin: 0 0 12px; font-size: 14px; color: #555;">
            This link expires in <b>15 minutes</b> and can only be used once.
        </p>

        <p style="margin: 0 0 12px; font-size: 14px; color: #555;">
            For your security, please don't share this link with anyone.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">

        <p style="margin: 0; font-size: 13px; color: #888;">
            If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.
        </p>
    </div>
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