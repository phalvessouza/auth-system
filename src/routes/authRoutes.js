const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const validate = require("../middlewares/validate");
const auth = require("../middlewares/auth");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Rotas de autenticação
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login de usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Username ou Email do usuário
 *               password:
 *                 type: string
 *                 description: Senha do usuário
 *     responses:
 *       200:
 *         description: Logado com sucesso
 *       401:
 *         description: Usuário não encontrado ou senha incorreta
 */
router.post(
  "/login",
  [
    body("identifier").isString().withMessage("Username or Email is required"),
    body("password").isString().withMessage("Password is required"),
  ],
  validate,
  authController.login
);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registro de usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nome de usuário
 *               email:
 *                 type: string
 *                 description: Email do usuário
 *               password:
 *                 type: string
 *                 description: Senha do usuário
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Username ou email já está em uso
 */
router.post(
  "/register",
  [
    body("username").isString().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isString()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  validate,
  authController.register
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout de usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token do usuário
 *     responses:
 *       200:
 *         description: Logout com sucesso
 *       400:
 *         description: Refresh token é obrigatório
 */
router.post(
  "/logout",
  [body("refreshToken").isString().withMessage("Refresh token is required")],
  validate,
  authController.logout
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicitação de redefinição de senha
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email do usuário
 *     responses:
 *       200:
 *         description: Email de redefinição de senha enviado
 *       500:
 *         description: Erro ao enviar email
 */
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Valid email is required")],
  validate,
  authController.forgotPassword
);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Redefinição de senha
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token de redefinição de senha
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: Nova senha do usuário
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       500:
 *         description: Erro ao redefinir senha
 */
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
