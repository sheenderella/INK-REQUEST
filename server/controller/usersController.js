import User from '../model/users.js';

//REGISTER
export const createUser = async (req, res) => {
  try {
    const { first_name, middle_name, last_name, department, email, password, role } = req.body;

    // Create a new user
    const newUser = new User({
      first_name,
      middle_name,
      last_name,
      department,
      email,
      password,
      role,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Send the saved user as the response
    res.status(201).json(savedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

