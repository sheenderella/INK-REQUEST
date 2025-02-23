import Inventory from '../model/inventory.js';

/**
 * Get all inventory items.
 */
export const getAllInventory = async (req, res) => {
  try {
    const inventoryList = await Inventory.find();
    res.status(200).json(inventoryList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Add a new inventory item.
 * Expected req.body: { ink_name, color, quantity, volume }
 */
export const addInventory = async (req, res) => {
  try {
    const { ink_name, color, quantity, volume } = req.body;

    // Check if ink name already exists
    const existingInk = await Inventory.findOne({ ink_name });
    if (existingInk) {
      return res.status(400).json({ message: 'Ink model already exists' });
    }

    const newInventory = new Inventory({
      ink_name,
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
    const { ink_name, color, quantity, volume } = req.body;

    let updateData = {};
    if (ink_name) {
      // Ensure new ink name doesn't conflict with another entry
      const existingInk = await Inventory.findOne({ ink_name });
      if (existingInk && existingInk._id.toString() !== id) {
        return res.status(400).json({ message: 'Ink model name already exists' });
      }
      updateData.ink_name = ink_name;
    }
    if (color) updateData.color = color;
    if (quantity) updateData.quantity = quantity;
    if (volume) updateData.volume = volume;

    const updatedInventory = await Inventory.findByIdAndUpdate(id, updateData, { new: true });

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
