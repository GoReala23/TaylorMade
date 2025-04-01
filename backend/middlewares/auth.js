const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/config');
const UnauthorizedError = require('../errors/UnauthorizedError');

const User = require('../models/user');

const auth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authorization Required',
      message: 'No token provided or invalid token format',
    });
  }
  const token = authorization.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (!payload || !payload.userId) {
      throw new UnauthorizedError('Invalid token payload');
    }
    req.user = {
      userId: payload.userId,
      isAdmin: payload.isAdmin || false,
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Token verification failed',
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Please login again',
      });
    }
    next(err);
  }
};

module.exports = auth;
