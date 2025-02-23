import bcrypt from 'bcryptjs';
import User from '../model/users.js';

export const createDefaultAdmin = async () => {
  try {
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      console.log('Default admin already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const newAdmin = new User({
      first_name: 'Admin',
      last_name: 'User',
      username: process.env.ADMIN_USERNAME,
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    });

    await newAdmin.save();
    console.log('Default admin account created successfully.');
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};
