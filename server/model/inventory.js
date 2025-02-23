import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    // Reference to a standardized InkModel document
    ink_model: { type: mongoose.Schema.Types.ObjectId, ref: 'InkModel', required: true },
    // The color for this specific batch (e.g., black, blue, magenta, yellow)
    color: { type: String, required: true, maxlength: 20 },
    // Volume per unit in ml (e.g., 100 ml per bottle)
    volume: { type: Number, required: true },
    // Available stock in this batch
    quantity: { type: Number, required: true },
    // Original stock count for this batch (for tracking purposes)
    initialQuantity: { type: Number, required: true }
  },
  { timestamps: true }
);

// Virtual to display volume with "ml" appended
inventorySchema.virtual('displayVolume').get(function () {
  return `${this.volume} ml`;
});

// Include virtuals in JSON output
inventorySchema.set('toJSON', { virtuals: true });

export default mongoose.model('Inventory', inventorySchema);
