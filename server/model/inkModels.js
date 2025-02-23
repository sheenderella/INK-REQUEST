import mongoose from 'mongoose';

const inkModelSchema = new mongoose.Schema(
  {
    ink_name: { type: String, required: true, unique: true, maxlength: 100 }
  },
  { timestamps: true }
);

export default mongoose.model('InkModel', inkModelSchema);
