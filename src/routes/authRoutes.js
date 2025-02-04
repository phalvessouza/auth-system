const express = require("express");
const { body, validationResult } = require("express-validator");
const authController = require("../controllers/authController");

const router = express.Router();

// Middleware para lidar com erros de validação
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Rotas de autenticação
router.post(
  "/login",
  [
    body("username").isString().notEmpty().withMessage("Username is required"),
    body("password").isString().notEmpty().withMessage("Password is required"),
  ],
  validate,
  authController.login
);

router.post(
  "/register",
  [
    body("username").isString().notEmpty().withMessage("Username is required"),
    body("password")
      .isString()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  validate,
  authController.register
);

router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

module.exports = router;
