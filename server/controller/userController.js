// controller/userController.js
import bcrypt from 'bcryptjs';
import User from '../model/users.js';


export const createUser = async (req, res) => {
  try {
    let { first_name, last_name, username, email, password, department } = req.body;

    if (!password) {
      password = "password123";
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    if (!username) {
      if (!last_name) {
        return res.status(400).json({ message: 'Last name is required to generate a username.' });
      }
      const cleanLastName = last_name.replace(/\s+/g, '').toLowerCase();
      

      const count = await User.countDocuments({ username: new RegExp(`^${cleanLastName}`, 'i') });
      

      username = `${cleanLastName}${(count + 1).toString().padStart(3, '0')}`;
    }


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


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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


export const updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      
      let updatedData = {};
      for (const key in req.body) {
        if (req.body[key] !== "") {
          updatedData[key] = req.body[key];
        }
      }
  
      const currentUser = await User.findById(id);
      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  

      for (const key in updatedData) {
        if (key === "password") continue;
        if (currentUser[key] !== undefined && currentUser[key] == updatedData[key]) {
          delete updatedData[key];
        }
      }
  
      if (Object.keys(updatedData).length === 0) {
        return res.status(200).json({ message: 'No changes detected', user: currentUser });
      }
  
      if (updatedData.password) {
        updatedData.password = await bcrypt.hash(updatedData.password, 10);
      }
  
      const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true }).select('-password');
      res.status(200).json({ message: 'User updated successfully', user: updatedUser });
      
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };


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

export const changePassword = async (req, res) => {
  try {
    const { id, oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New passwords do not match." });
    }

    // Secure password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
