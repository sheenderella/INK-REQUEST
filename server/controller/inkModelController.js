import InkModel from '../model/inkModels.js';

/**
 * Get all ink models.
 */
export const getAllInkModels = async (req, res) => {
  try {
    const inkModels = await InkModel.find();
    res.status(200).json(inkModels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get a specific ink model by ID.
 */
export const getInkModelById = async (req, res) => {
  try {
    const { id } = req.params;
    const inkModel = await InkModel.findById(id);
    if (!inkModel) {
      return res.status(404).json({ message: 'Ink model not found' });
    }
    res.status(200).json(inkModel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Add a new ink model.
 * Expected req.body: { ink_name }
 */
export const addInkModel = async (req, res) => {
  try {
    const { ink_name } = req.body;

    // Check if ink model already exists
    const existingInk = await InkModel.findOne({ ink_name });
    if (existingInk) {
      return res.status(400).json({ message: 'Ink model already exists' });
    }

    const newInkModel = new InkModel({
      ink_name
    });

    const savedInkModel = await newInkModel.save();
    res.status(201).json({ message: 'Ink model added successfully', inkModel: savedInkModel });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update an existing ink model.
 * Expected req.body: { ink_name }
 */
export const updateInkModel = async (req, res) => {
  try {
    const { id } = req.params;
    const { ink_name } = req.body;

    const updatedInkModel = await InkModel.findByIdAndUpdate(id, { ink_name }, { new: true });
    if (!updatedInkModel) {
      return res.status(404).json({ message: 'Ink model not found' });
    }

    res.status(200).json({ message: 'Ink model updated successfully', inkModel: updatedInkModel });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete an ink model.
 */
export const deleteInkModel = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInkModel = await InkModel.findByIdAndDelete(id);
    if (!deletedInkModel) {
      return res.status(404).json({ message: 'Ink model not found' });
    }
    res.status(200).json({ message: 'Ink model deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
