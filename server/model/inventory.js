import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    // Reference to a standardized ink model
    ink_model: { type: mongoose.Schema.Types.ObjectId, ref: 'InkModel', required: true },
    // Color of this specific batch (e.g., Black, Cyan, Magenta, Yellow)
    color: { type: String, required: true, maxlength: 20 },
    // Volume per unit in ml
    volume: { type: Number, required: true },
    // Available stock in this batch
    quantity: { type: Number, required: true },
    // Original stock count for this batch
    initialQuantity: { type: Number, required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Inventory', inventorySchema);
