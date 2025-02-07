const argon2 = require("argon2");

const hashPassword = async (password) => {
  return await argon2.hash(password);
};

const comparePassword = async (hashedPassword, password) => {
  return await argon2.verify(hashedPassword, password);
};

module.exports = {
  hashPassword,
  comparePassword,
};
