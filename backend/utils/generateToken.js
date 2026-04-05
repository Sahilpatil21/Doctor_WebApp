const jwt = require('jsonwebtoken');

const DEFAULT_JWT_EXPIRE = '30d';
const VALID_EXPIRE_PATTERN = /^(\d+|\d+\s*(ms|s|m|h|d|w|y))$/i;

const generateToken = (id) => {
  const expiresIn = String(process.env.JWT_EXPIRE || DEFAULT_JWT_EXPIRE).trim();
  const tokenExpiry = VALID_EXPIRE_PATTERN.test(expiresIn)
    ? expiresIn
    : DEFAULT_JWT_EXPIRE;

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: tokenExpiry,
  });
};

module.exports = generateToken;
