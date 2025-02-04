const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const routes = require("./routes");
const sequelize = require("./config/database");
const User = require("./models/User");
const winston = require("winston");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Middleware para limitar a taxa de requisições
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);

// Usar as rotas
app.use("/api", routes);

// Middleware para tratamento de erro
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send("Something broke!");
});

// Sincronizar o modelo com o banco de dados
sequelize
  .sync({ force: false }) // Use { force: true } para recriar a tabela se ela já existir
  .then(() => {
    logger.info("Database & tables created!");
  })
  .catch((err) => {
    logger.error("Unable to create tables:", err);
  });

// Iniciar o servidor
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
