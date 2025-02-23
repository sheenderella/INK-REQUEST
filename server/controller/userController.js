// controller/userController.js

import bcrypt from 'bcryptjs';
import User from '../model/users.js';

/**
 * CREATE a new user (Register)
 * - Default password: "password123" if not provided.
 * - Default username: generated from the last name (spaces removed) plus a padded count.
 */


export const createUser = async (req, res) => {
  try {
    let { first_name, last_name, username, email, password, department } = req.body;

    // Set default password if not provided
    if (!password) {
      password = "password123";
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate default username if not provided
    if (!username) {
      if (!last_name) {
        return res.status(400).json({ message: 'Last name is required to generate a username.' });
      }
      const cleanLastName = last_name.replace(/\s+/g, '').toLowerCase();
      
      // Count how many users already have a username starting with the cleanLastName (case-insensitive)
      const count = await User.countDocuments({ username: new RegExp(`^${cleanLastName}`, 'i') });
      
      // Generate username with padded count (e.g., smith001, smith002, etc.)
      username = `${cleanLastName}${(count + 1).toString().padStart(3, '0')}`;
    }

    // Create a new user with the defaulted/generated values
    const newUser = new User({
      first_name,
      last_name,
      username,
      email,
      password: hashedPassword,
      department,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * READ all users
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // exclude password field
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * READ a single user by ID
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * UPDATE a user
 */
export const updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Build updatedData from request body ignoring empty fields
      let updatedData = {};
      for (const key in req.body) {
        if (req.body[key] !== "") {
          updatedData[key] = req.body[key];
        }
      }
  
      // Retrieve the current user data
      const currentUser = await User.findById(id);
      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Compare updatedData with currentUser and remove fields that haven't changed
      // For password, we always update if provided since the stored value is hashed.
      for (const key in updatedData) {
        if (key === "password") continue;
        if (currentUser[key] !== undefined && currentUser[key] == updatedData[key]) {
          delete updatedData[key];
        }
      }
  
      // If nothing is left to update, return a message indicating no changes were detected
      if (Object.keys(updatedData).length === 0) {
        return res.status(200).json({ message: 'No changes detected', user: currentUser });
      }
  
      // If password is provided in the update, hash it
      if (updatedData.password) {
        updatedData.password = await bcrypt.hash(updatedData.password, 10);
      }
  
      // Update the user with only the changed fields
      const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true }).select('-password');
      res.status(200).json({ message: 'User updated successfully', user: updatedUser });
      
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

/**
 * DELETE a user
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
