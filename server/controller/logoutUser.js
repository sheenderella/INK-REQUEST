// controllers/logoutUser.js
import { addTokenToBlacklist } from '../middleware/tokenBlacklist.js';

export const logoutUser = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(400).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  addTokenToBlacklist(token);
  
  return res.status(200).json({ message: 'Logout successful' });
};
