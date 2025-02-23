import mongoose from 'mongoose';

const inkIssuanceSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'InkRequest', required: true },
    ink: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    issued_quantity: { type: Number, required: true },
    issued_to: { type: String, required: true, maxlength: 100 },
    issued_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issue_date: { type: Date, default: Date.now },
    source: { type: String, enum: ['Ink In Use', 'Inventory'], required: true } // New field to track source of ink
  },
  { timestamps: true }
);

export default mongoose.model('InkIssuance', inkIssuanceSchema);
