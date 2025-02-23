import mongoose from 'mongoose';

const inkRequestSchema = new mongoose.Schema(
  {
    ink: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    requested_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quantity_requested: { type: Number, required: true },
    supervisor_approval: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    supervisor_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    supervisor_date: { type: Date },
    admin_approval: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    admin_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    admin_date: { type: Date },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Fulfilled'], default: 'Pending' },
    request_date: { type: Date, default: Date.now },
    consumption_status: { 
      type: String, 
      enum: ['Fully Used', 'Partially Used'], 
      default: 'Fully Used' 
    }, // New field for tracking partial consumption
    remaining_quantity: { type: Number, default: 0 }, // Stores remaining ink if partially used
  },
  { timestamps: true }
);

export default mongoose.model('InkRequest', inkRequestSchema);
