const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const routes = require("./routes");
const sequelize = require("./config/database");
const logger = require("./utils/logger");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Carregar variáveis de ambiente
dotenv.config();

// Criar a aplicação Express
const app = express();

// Porta do servidor
const PORT = process.env.PORT || 3000;

// Configuração do CORS
const corsOptions = {
  origin: "http://127.0.0.1:5500", // Substitua pelo seu domínio
  credentials: true, // Permitir cookies nas requisições CORS
};

// Middleware para limitar a taxa de requisições
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: "Too many requests from this IP, please try again later.",
});

// limitar as requisições para todas as rotas
app.use(limiter);

// Usar os middlewares de segurança
app.use(cors(corsOptions));

// Usar os middlewares de segurança
app.use(helmet());

// Usar o middleware para receber JSON
app.use(express.json());

// Usar o middleware para receber dados de formulário
app.use(cookieParser());

// Middleware para logar as requisições
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Configuração do Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Login System API",
      version: "1.0.0",
      description: "API para o sistema de login",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/models/*.js"], // Caminho para os arquivos de rotas e modelos
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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

// Middleware para tratar erros
app.use(errorHandler);

// Iniciar o servidor
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
