import User from '../model/users.js';

// REGISTER
export const createUser = async (req, res) => {
  try {
    const { first_name, last_name, department, email, password, role } = req.body;

    const userCount = await User.countDocuments({ first_name, last_name });

    const username = `${first_name.toLowerCase()}${last_name.toLowerCase()}${userCount + 1}`;

    console.log("Generated Username:", username); 

    const newUser = new User({
      first_name,
      last_name,
      username,
      department,
      email,
      password,
      role,
    });

    console.log("User Object Before Save:", newUser);

    // Save the user to the database
    const savedUser = await newUser.save();

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
