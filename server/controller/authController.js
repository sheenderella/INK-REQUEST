import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/users.js'; // Import the User model

// Login controller function
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    
    // If user does not exist, send an error message
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    // If passwords do not match, send an error message
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create a JWT token with the user data (you can also add other info like role or permissions)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET, // Make sure to add JWT_SECRET to your .env file
      { expiresIn: '1h' } // Token expiration time (1 hour in this case)
    );

    // Send response with the token
    res.status(200).json({
      message: 'Login successful',
      token, // Send back the generated JWT token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
