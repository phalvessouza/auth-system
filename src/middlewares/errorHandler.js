const { ValidationError } = require("express-validation");

const errorHandler = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err);
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }

  console.error(err.stack);
  res.status(500).json({ message: "Erro interno do servidor" });
};

module.exports = errorHandler;
