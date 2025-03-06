import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    ink_model: { type: mongoose.Schema.Types.ObjectId, ref: 'InkModel', required: true },
    color: { type: String, required: true, maxlength: 20 },
    volume: { type: Number, required: true },
    quantity: { type: Number, required: true },
    initialQuantity: { type: Number, required: true }
  },
  { timestamps: true }
);

inventorySchema.virtual('displayVolume').get(function () {
  return `${this.volume} ml`;
});

inventorySchema.set('toJSON', { virtuals: true });

export default mongoose.model('Inventory', inventorySchema);
