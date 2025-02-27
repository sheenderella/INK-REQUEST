import { addTokenToBlacklist } from '../middleware/tokenBlacklist.js';

export const logoutUser = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(400).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token to blacklist:', token); // Debugging output

    addTokenToBlacklist(token);
    
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout Error:', error); // Logs the error
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
