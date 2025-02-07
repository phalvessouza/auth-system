const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const routes = require("./routes");
const sequelize = require("./config/database");
const logger = require("./utils/logger");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Configuração do CORS
const corsOptions = {
  origin: "http://127.0.0.1:5500", // Substitua pelo seu domínio
  credentials: true, // Permitir cookies nas requisições CORS
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
