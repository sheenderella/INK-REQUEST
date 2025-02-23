// middleware/verifyToken.js
import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from './tokenBlacklist.js';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  // Check if token is blacklisted
  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ message: 'Token has been invalidated. Please log in again.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid', error: error.message });
  }
};
