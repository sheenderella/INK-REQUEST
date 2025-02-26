import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/users.js';

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.error('User not found:', username);
      return res.status(400).json({ message: 'Invalid credentials: User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isMatch);  
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials: Incorrect password' });
    }

    // Create a JWT token
    let token;
    try {
      token = jwt.sign(
        { userId: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET, 
        { expiresIn: '1h' } 
      );
      console.log('Generated token:', token); 
      console.log('User ID:', user._id); 
    } catch (jwtError) {
      console.error('Error generating token:', jwtError); 
      return res.status(500).json({ message: 'Failed to generate token' });
    }

    // Send the token, userId, and the user's role back to the client
    return res.status(200).json({
      message: 'Login successful',
      token: token,
      userId: user._id,  // Send the userId to store in frontend
      role: user.role,    // Send the role to manage access control on the frontend
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ message: 'Server error, please try again later.', error: error.message });
  }
};
