const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const routes = require("./routes");
const sequelize = require("./config/database");
const logger = require("./utils/logger");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Middleware para tratamento de erro
const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

// Middlewares de segurança
const corsOptions = {
  origin: "http://localhost:3000", // Substitua pelo seu domínio
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
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
  res.status(500).json({ message: "Something broke!", error: err.message });
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
