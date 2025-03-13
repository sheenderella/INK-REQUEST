import mongoose from 'mongoose';

const inkRequestSchema = new mongoose.Schema(
  {
    ink: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' }],    
    requested_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quantity_requested: { type: Number, required: true, default: 1 },
    ink_type: { type: String, enum: ['black', 'colored'], default: 'black' },
    supervisor_approval: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    supervisor_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    supervisor_date: { type: Date },
    admin_approval: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    admin_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    admin_date: { type: Date },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Fulfilled'], default: 'Pending' },
    request_date: { type: Date, default: Date.now },
    consumption_status: { type: mongoose.Schema.Types.Mixed, default: 'Not Processed' }

  },
  { timestamps: true }
);

export default mongoose.model('InkRequest', inkRequestSchema);
