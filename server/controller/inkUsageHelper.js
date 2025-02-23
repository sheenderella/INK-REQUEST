// inkUsageHelper.js
import InkInUse from '../model/ink_in_use.js';

/**
 * Deduct a specified amount from an active Ink In Use record.
 * @param {ObjectId} inkId - The Inventory record ID.
 * @param {Number} amount - The amount to deduct.
 * @returns {Object} { remaining, source }
 *  - remaining: the amount that still needs to be deducted from Inventory.
 *  - source: a string indicating if deduction came solely from Ink In Use or partly from Inventory.
 */
export const deductFromInkInUse = async (inkId, amount) => {
  let remaining = amount;
  let source = '';

  // Find an active Ink In Use record for the given ink.
  const record = await InkInUse.findOne({ ink: inkId, status: 'In Use' });
  if (record) {
    if (record.quantity_used >= remaining) {
      record.quantity_used -= remaining;
      source = 'Ink In Use';
      remaining = 0;
      if (record.quantity_used === 0) {
        record.status = 'Transferred'; // Bottle is finished.
      }
      await record.save();
      return { remaining, source };
    } else {
      // Not enough: use all available in Ink In Use.
      remaining -= record.quantity_used;
      record.quantity_used = 0;
      record.status = 'Transferred';
      source = 'Ink In Use + Inventory';
      await record.save();
      return { remaining, source };
    }
  }
  // If no Ink In Use record is found, nothing is deducted.
  return { remaining, source };
};
