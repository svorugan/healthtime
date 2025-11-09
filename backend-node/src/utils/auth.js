const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const createAccessToken = (userId, role) => {
  const expirationHours = 24;
  const payload = {
    user_id: userId,
    role: role,
    exp: Math.floor(Date.now() / 1000) + (expirationHours * 60 * 60)
  };
  return jwt.sign(payload, process.env.JWT_SECRET);
};

module.exports = {
  hashPassword,
  verifyPassword,
  createAccessToken
};
