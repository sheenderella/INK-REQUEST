import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from './tokenBlacklist.js';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("Authorization Header Received:", authHeader); // Debugging

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  console.log("Extracted Token:", token); // Debugging

  if (!token) {
    return res.status(403).json({ message: 'Token format incorrect' });
  }

  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ message: 'Token has been blacklisted' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("Token verification error:", err.message); // Debugging
      return res.status(403).json({ message: 'Invalid token' });
    }

    console.log("Decoded User from Token:", decoded); // Debugging
    req.user = decoded;
    next();
  });
};
