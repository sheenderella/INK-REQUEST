import mongoose from 'mongoose';
import InkModel from '../model/inkModels.js';
import Inventory from '../model/inventory.js';

export const getAllInkModels = async (req, res) => {
  try {
    const inkModels = await InkModel.find();
    res.status(200).json(inkModels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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


export const addInkModel = async (req, res) => {
  try {
    const { ink_name, colors } = req.body;

    const existingInk = await InkModel.findOne({ ink_name });
    if (existingInk) {
      return res.status(400).json({ message: 'Ink model already exists' });
    }

    if (!Array.isArray(colors) || colors.length === 0) {
      return res.status(400).json({ message: 'Colors must be a non-empty array' });
    }

    const newInkModel = new InkModel({
      ink_name,
      colors
    });

    const savedInkModel = await newInkModel.save();
    res.status(201).json({ message: 'Ink model added successfully', inkModel: savedInkModel });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const updateInkModel = async (req, res) => {
  try {
    const { id } = req.params;
    const { ink_name, colors } = req.body;

    let updateData = {};
    if (ink_name) updateData.ink_name = ink_name;
    if (colors) {
      if (!Array.isArray(colors) || colors.length === 0) {
        return res.status(400).json({ message: 'Colors must be a non-empty array' });
      }
      updateData.colors = colors;
    }

    const updatedInkModel = await InkModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedInkModel) {
      return res.status(404).json({ message: 'Ink model not found' });
    }

    res.status(200).json({ message: 'Ink model updated successfully', inkModel: updatedInkModel });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const deleteInkModel = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Ink Model ID' });
    }
    const isInkInUse = await Inventory.findOne({ ink_model: id });

    if (isInkInUse) {
      return res.status(400).json({ message: 'Cannot delete ink model, it is currently in use in the inventory.' });
    }

    const deletedInkModel = await InkModel.findByIdAndDelete(id);

    if (!deletedInkModel) {
      return res.status(404).json({ message: 'Ink model not found' });
    }

    res.status(200).json({ message: 'Ink model deleted successfully' });
  } catch (error) {
    console.error("Error deleting ink model:", error);
    res.status(500).json({ error: error.message });
  }
};