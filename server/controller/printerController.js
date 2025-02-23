import PrinterModel from '../model/printerModel.js';
import InkModel from '../model/inkModels.js'; 


export const getAllPrinters = async (req, res) => {
  try {
    const printers = await PrinterModel.find().populate('compatible_inks');
    res.status(200).json(printers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getPrinterById = async (req, res) => {
  try {
    const { id } = req.params;
    const printer = await PrinterModel.findById(id).populate('compatible_inks');
    if (!printer) {
      return res.status(404).json({ message: 'Printer not found' });
    }
    res.status(200).json(printer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const addPrinter = async (req, res) => {
  try {
    const { printer_name, compatible_inks } = req.body;

    const existingPrinter = await PrinterModel.findOne({ printer_name });
    if (existingPrinter) {
      return res.status(400).json({ message: 'Printer model already exists' });
    }

    const inksExist = await InkModel.find({ _id: { $in: compatible_inks } });
    if (inksExist.length !== compatible_inks.length) {
      return res.status(400).json({ message: 'Some ink IDs are invalid' });
    }

    const newPrinter = new PrinterModel({
      printer_name,
      compatible_inks
    });

    const savedPrinter = await newPrinter.save();
    res.status(201).json({ message: 'Printer model added successfully', printer: savedPrinter });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const updatePrinter = async (req, res) => {
  try {
    const { id } = req.params;
    const { printer_name, compatible_inks } = req.body;

    let updateData = {};
    if (printer_name) updateData.printer_name = printer_name;
    if (compatible_inks) {
      const inksExist = await InkModel.find({ _id: { $in: compatible_inks } });
      if (inksExist.length !== compatible_inks.length) {
        return res.status(400).json({ message: 'Some ink IDs are invalid' });
      }
      updateData.compatible_inks = compatible_inks;
    }

    const updatedPrinter = await PrinterModel.findByIdAndUpdate(id, updateData, { new: true }).populate('compatible_inks');
    if (!updatedPrinter) {
      return res.status(404).json({ message: 'Printer model not found' });
    }

    res.status(200).json({ message: 'Printer model updated successfully', printer: updatedPrinter });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const deletePrinter = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPrinter = await PrinterModel.findByIdAndDelete(id);
    if (!deletedPrinter) {
      return res.status(404).json({ message: 'Printer model not found' });
    }
    res.status(200).json({ message: 'Printer model deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
