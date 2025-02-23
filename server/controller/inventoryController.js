import Inventory from '../model/inventory.js';
import InkModel from '../model/inkModels.js';

/**
 * Get all inventory items.
 */
export const getAllInventory = async (req, res) => {
  try {
    const inventoryList = await Inventory.find().populate('ink_model');
    res.status(200).json(inventoryList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Add a new inventory item.
 * Expected req.body: { ink_model_id, color, quantity, volume }
 */
export const addInventory = async (req, res) => {
  try {
    const { ink_model_id, color, quantity, volume } = req.body;

    // Validate that the referenced ink model exists
    const inkModelExists = await InkModel.findById(ink_model_id);
    if (!inkModelExists) {
      return res.status(400).json({ message: 'Invalid ink model ID' });
    }

    // Create a new inventory entry (allowing multiple entries for the same ink model)
    const newInventory = new Inventory({
      ink_model: ink_model_id,
      color,
      quantity,
      volume,
      initialQuantity: quantity
    });

    const savedInventory = await newInventory.save();
    res.status(201).json({ message: 'Inventory added successfully', inventory: savedInventory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update an inventory item.
 */
export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { ink_model_id, color, quantity, volume } = req.body;

    let updateData = {};
    if (ink_model_id) {
      // Validate that the new ink model exists
      const inkModelExists = await InkModel.findById(ink_model_id);
      if (!inkModelExists) {
        return res.status(400).json({ message: 'Invalid ink model ID' });
      }
      updateData.ink_model = ink_model_id;
    }
    if (color) updateData.color = color;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (volume) updateData.volume = volume;

    const updatedInventory = await Inventory.findByIdAndUpdate(id, updateData, { new: true }).populate('ink_model');
    if (!updatedInventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.status(200).json({ message: 'Inventory updated successfully', inventory: updatedInventory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete an inventory item.
 */
export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInventory = await Inventory.findByIdAndDelete(id);
    if (!deletedInventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.status(200).json({ message: 'Inventory deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
