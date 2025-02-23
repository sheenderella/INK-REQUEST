// authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/users.js';

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create a JWT token without an expiration time
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET
      // Wala nang expiresIn dito
    );

    return res.status(200).json({
      message: 'Login successful',
      token: token,
      role: user.role,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
