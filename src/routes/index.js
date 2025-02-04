const express = require("express");
const authRoutes = require("./authRoutes");

const router = express.Router();

// Usar as rotas de autenticação
router.use("/auth", authRoutes);

module.exports = router;
