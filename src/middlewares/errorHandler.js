const { validationResult, ValidationError } = require("express-validator");
const { DatabaseError } = require("sequelize");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("Validation error", { errors: errors.array() });
    return res.status(400).json({ errors: errors.array() });
  }

  // Erros de validação
  if (err instanceof ValidationError) {
    logger.warn("Validation error", { errors: err.errors });
    return res.status(400).json({
      message: "Erro de validação",
      errors: err.errors.map((error) => ({
        field: error.param,
        message: error.msg,
      })),
    });
  }

  // Erros de autenticação
  if (err.name === "UnauthorizedError") {
    logger.warn("Unauthorized error", { message: err.message });
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }

  // Erros de banco de dados
  if (err instanceof DatabaseError) {
    logger.error("Database error", { message: err.message });
    return res.status(500).json({
      message: "Erro de banco de dados",
      error: err.message,
    });
  }

  // Outros erros
  logger.error("Internal server error", {
    message: err.message,
    stack: err.stack,
  });
  res.status(500).json({ message: "Erro interno do servidor" });
};

module.exports = errorHandler;
