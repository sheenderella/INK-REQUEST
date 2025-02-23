import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'employee' },
    department: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
