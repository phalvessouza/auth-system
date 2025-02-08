const { validationResult } = require("express-validator");

const errorHandler = (err, req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }

  console.error(err.stack);
  res.status(500).json({ message: "Erro interno do servidor" });
};

module.exports = errorHandler;
