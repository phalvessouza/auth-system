const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { Op } = require("sequelize");
const crypto = require("crypto");
const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");
const authService = require("../services/authService");

dotenv.config();

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordIsValid = await authService.verifyPassword(
      user.password,
      password
    );

    if (!passwordIsValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = authService.generateToken(user.id);
    const refreshToken = authService.generateRefreshToken(user.id);

    await RefreshToken.create({ token: refreshToken, userId: user.id });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ auth: true, token, refreshToken });
  } catch (error) {
    res.status(500).json({
      message: "There was a problem logging in the user.",
      error: error.message,
    });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ where: { username } });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const emailExists = await User.findOne({ where: { email } });

    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await authService.hashPassword(password);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({
      message: "There was a problem registering the user.",
      error: error.message,
    });
  }
};

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: "Failed to authenticate token" });
    }

    req.userId = decoded.id;
    next();
  });
};

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(403).json({ message: "No refresh token provided" });
  }

  try {
    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to authenticate refresh token" });
      }

      const newToken = authService.generateToken(decoded.id);

      res.cookie("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      res.status(200).json({ auth: true, token: newToken });
    });
  } catch (error) {
    res.status(500).json({
      message: "There was a problem refreshing the token.",
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      await RefreshToken.destroy({ where: { userId: decoded.id } });
    } catch (error) {
      return res.status(500).json({
        message: "There was a problem logging out.",
        error: error.message,
      });
    }
  }

  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.status(200).json({ auth: false, message: "Logged out successfully" });
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    const resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.update({ resetPasswordToken: token, resetPasswordExpires });

    await authService.sendResetPasswordEmail(user, token, req);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending email", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired" });
    }

    const hashedPassword = await authService.hashPassword(password);
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    res.status(500).json({
      message: "There was a problem resetting the password.",
      error: error.message,
    });
  }
};

module.exports = {
  login,
  register,
  verifyToken,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
};
