import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    ink_model: { type: mongoose.Schema.Types.ObjectId, ref: 'InkModel', required: true }, // Reference standardized ink
    color: { type: String, required: true, maxlength: 20 }, // Black, Cyan, Magenta, Yellow
    volume: { type: Number, required: true }, // Volume per unit in ml
    quantity: { type: Number, required: true }, // Available stock
    initialQuantity: { type: Number, required: true } // Track original stock
  },
  { timestamps: true }
);

export default mongoose.model('Inventory', inventorySchema);
