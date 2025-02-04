const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const validate = require("../middlewares/validate");

const router = express.Router();

// Rota para login
router.post(
  "/login",
  [
    body("username").isString().withMessage("Username is required"),
    body("password").isString().withMessage("Password is required"),
  ],
  validate,
  authController.login
);

// Rota para registro
router.post(
  "/register",
  [
    body("username").isString().withMessage("Username is required"),
    body("password")
      .isString()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  validate,
  authController.register
);

// Rota para logout
router.post("/logout", authController.logout);

// Rota para solicitação de redefinição de senha
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Valid email is required")],
  validate,
  authController.forgotPassword
);

// Rota para redefinição de senha
router.post(
  "/reset-password/:token",
  [
    body("password")
      .isString()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  validate,
  authController.resetPassword
);

module.exports = router;
