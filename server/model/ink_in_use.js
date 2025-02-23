// ink_in_use.js
import mongoose from 'mongoose';

const inkInUseSchema = new mongoose.Schema(
  {
    // Uses default _id as usage_id
    ink: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: String, required: true, maxlength: 100 },
    quantity_used: { type: Number, required: true },
    // NEW: Track the color of the ink in use.
    color: { type: String, required: true, maxlength: 20 },
    status: { type: String, enum: ['In Use', 'Transferred'], default: 'In Use' },
    assigned_date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('InkInUse', inkInUseSchema);
