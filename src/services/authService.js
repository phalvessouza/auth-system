const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const dotenv = require("dotenv");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");

dotenv.config();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: 86400, // 24 hours
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: 604800, // 7 days
  });
};

const hashPassword = async (password) => {
  return await argon2.hash(password);
};

const verifyPassword = async (hashedPassword, password) => {
  return await argon2.verify(hashedPassword, password);
};

const sendResetPasswordEmail = async (user, token, req) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    to: user.email,
    from: process.env.EMAIL,
    subject: "Password Reset",
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
           Please click on the following link, or paste this into your browser to complete the process:\n\n
           http://${req.headers.host}/reset-password/${token}\n\n
           If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  await transporter.sendMail(mailOptions);
};

const loginUser = async (username, password) => {
  const user = await User.findOne({ where: { username } });

  if (!user) {
    throw new Error("User not found");
  }

  const passwordIsValid = await verifyPassword(user.password, password);

  if (!passwordIsValid) {
    throw new Error("Invalid password");
  }

  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await RefreshToken.create({ token: refreshToken, userId: user.id });

  return { token, refreshToken };
};

const registerUser = async (username, email, password) => {
  const userExists = await User.findOne({ where: { username } });

  if (userExists) {
    throw new Error("User already exists");
  }

  const emailExists = await User.findOne({ where: { email } });

  if (emailExists) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await hashPassword(password);
  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  return newUser;
};

const refreshUserToken = async (refreshToken) => {
  const storedToken = await RefreshToken.findOne({
    where: { token: refreshToken },
  });

  if (!storedToken) {
    throw new Error("Invalid refresh token");
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  const newToken = generateToken(decoded.id);

  return newToken;
};

const logoutUser = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  await RefreshToken.destroy({ where: { userId: decoded.id } });
};

const forgotPassword = async (email, req) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error("User not found");
  }

  const token = crypto.randomBytes(20).toString("hex");
  const resetPasswordExpires = Date.now() + 3600000; // 1 hour

  await user.update({ resetPasswordToken: token, resetPasswordExpires });

  await sendResetPasswordEmail(user, token, req);
};

const resetPassword = async (token, password) => {
  const user = await User.findOne({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { [Op.gt]: Date.now() },
    },
  });

  if (!user) {
    throw new Error("Password reset token is invalid or has expired");
  }

  const hashedPassword = await hashPassword(password);
  await user.update({
    password: hashedPassword,
    resetPasswordToken: null,
    resetPasswordExpires: null,
  });
};

module.exports = {
  generateToken,
  generateRefreshToken,
  hashPassword,
  verifyPassword,
  sendResetPasswordEmail,
  loginUser,
  registerUser,
  refreshUserToken,
  logoutUser,
  forgotPassword,
  resetPassword,
};
