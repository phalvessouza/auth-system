const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");

dotenv.config();

// função para autenticar o usuário
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send("Invalid password");
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: 86400, // 24 hours
    });

    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: 604800, // 7 days
    });

    // Salvar o refresh token no banco de dados
    await RefreshToken.create({ token: refreshToken, userId: user.id });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).send({ auth: true, token, refreshToken });
  } catch (error) {
    res.status(500).send("There was a problem logging in the user.");
  }
};

// função para registrar um novo usuário
const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const userExists = await User.findOne({ where: { username } });

    if (userExists) {
      return res.status(400).send("User already exists");
    }

    const hashedPassword = bcrypt.hashSync(password, 12);
    const newUser = await User.create({ username, password: hashedPassword });

    res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(500).send("There was a problem registering the user.");
  }
};

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).send("No token provided");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(500).send("Failed to authenticate token");
    }

    req.userId = decoded.id;
    next();
  });
};

const refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(403).send("No refresh token provided");
  }

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(500).send("Failed to authenticate refresh token");
    }

    const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
      expiresIn: 86400, // 24 hours
    });

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).send({ auth: true, token: newToken });
  });
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.status(200).send({ auth: false, message: "Logged out successfully" });
};

module.exports = { login, register, verifyToken, refreshToken, logout };
