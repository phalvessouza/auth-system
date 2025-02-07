const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const authService = require("../services/authService");
const { Op } = require("sequelize");
const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");
const { hashPassword, comparePassword } = require("../utils/password");

dotenv.config();

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({
      where: {
        [Op.or]: [{ username: identifier }, { email: identifier }],
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    const isPasswordValid = await comparePassword(user.password, password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    const token = generateToken(user);
    const refreshToken = authService.generateRefreshToken(user.id);

    // Salvar o refresh token no banco de dados
    await RefreshToken.create({ token: refreshToken, userId: user.id });

    // Definir o refresh token no cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      message: "Logado com sucesso",
      token,
      refreshToken,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const register = async (req, res) => {
  try {
    // Verificar se o username já existe
    const existingUsername = await User.findOne({
      where: { username: req.body.username },
    });
    if (existingUsername) {
      return res.status(400).json({ message: "Username já está em uso" });
    }

    // Verificar se o email já existe
    const existingEmail = await User.findOne({
      where: { email: req.body.email },
    });
    if (existingEmail) {
      return res.status(400).json({ message: "Email já está em uso" });
    }

    const hashedPassword = await hashPassword(req.body.password);
    const user = new User({ ...req.body, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (err) {
    res.status(400).json({ message: err.message });
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
    const newToken = await authService.refreshUserToken(refreshToken);

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ auth: true, token: newToken });
  } catch (error) {
    res.status(500).json({
      message: "There was a problem refreshing the token.",
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    console.log("Decoded userId:", decoded.id); // Adicionar log
    const result = await RefreshToken.destroy({
      where: { userId: decoded.id },
    });
    console.log("Tokens deleted:", result); // Adicionar log
  } catch (error) {
    console.error("Error during logout:", error); // Adicionar log
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ message: "Invalid refresh token" });
    }
    return res.status(500).json({
      message: "There was a problem logging out.",
      error: error.message,
    });
  }

  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.status(200).json({ auth: false, message: "Logged out successfully" });
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email, req);
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
    await authService.resetPassword(token, password);
    res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    res.status(500).json({
      message: "There was a problem resetting the password.",
      error: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  res.status(200).json(req.user);
};

module.exports = {
  login,
  register,
  verifyToken,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
};
