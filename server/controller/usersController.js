import User from '../model/users.js';

// REGISTER
export const createUser = async (req, res) => {
  try {
    const { first_name, last_name, department, email, password, role } = req.body;

    // Ensure last_name has no spaces and is lowercase
    const trimmedLastName = last_name.trim().replace(/\s+/g, '').toLowerCase();

    const userCount = await User.countDocuments({ last_name });

    const username = `${trimmedLastName}${userCount + 1}`;

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

    res.status(201).json({ message: 'User created successfully', user: savedUser });

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
