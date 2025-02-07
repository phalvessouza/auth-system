const { validationResult } = require("express-validator");

const errorHandler = (err, req, res, next) => {
  if (err instanceof validationResult) {
    return res.status(err.statusCode).json(err);
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }

  console.error(err.stack);
  res.status(500).json({ message: "Erro interno do servidor" });
};

module.exports = errorHandler;
