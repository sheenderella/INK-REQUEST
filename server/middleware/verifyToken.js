import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from './tokenBlacklist.js';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];

  if (!token) return res.status(403).json({ message: 'Token format incorrect' });

  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ message: 'Token has been blacklisted' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    req.user = user;
    next();
  });
};
