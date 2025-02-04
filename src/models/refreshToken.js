const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // Nome da tabela de usuários
        key: "id",
      },
    },
  },
  {
    tableName: "RefreshTokens", // Especifica o nome da tabela
  }
);

module.exports = RefreshToken;
