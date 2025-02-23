import mongoose from 'mongoose';

const printerModelSchema = new mongoose.Schema(
  {
    printer_name: { type: String, required: true, unique: true, maxlength: 100 },
    compatible_inks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InkModel', required: true }] // Reference standardized ink models
  },
  { timestamps: true }
);

export default mongoose.model('PrinterModel', printerModelSchema);
