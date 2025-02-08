const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");

// Função para remover informações sensíveis dos logs
const filterSensitiveInfo = format((info) => {
  const sensitiveFields = ["password", "token", "refreshToken"];
  sensitiveFields.forEach((field) => {
    if (info.message && info.message[field]) {
      info.message[field] = "****";
    }
    if (info[field]) {
      info[field] = "****";
    }
  });
  return info;
});

const logger = createLogger({
  level: "info",
  format: format.combine(
    filterSensitiveInfo(),
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
    }),
  ],
});

module.exports = logger;
