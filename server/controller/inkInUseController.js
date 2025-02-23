import InkInUse from '../model/ink_in_use.js';

/**
 * Create a new Ink In Use record.
 * Expected req.body: { ink, department, quantity_used }
 * Optionally, the user is taken from req.user; if not present, a dummy value is used.
 */
export const addInkInUse = async (req, res) => {
  try {
    const { ink, department, quantity_used } = req.body;
    // Use dummy user ID if req.user is not set.
    const user = (req.user && req.user.id) || "000000000000000000000001";

    const newInkInUse = new InkInUse({
      ink,
      user,
      department,
      quantity_used,
      // status defaults to 'In Use', assigned_date defaults to now.
    });

    const savedInkInUse = await newInkInUse.save();
    res.status(201).json({
      message: "Ink In Use record added successfully",
      inkInUse: savedInkInUse
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retrieve all Ink In Use records.
 */
export const getAllInkInUse = async (req, res) => {
  try {
    const inkInUseRecords = await InkInUse.find()
      .populate('ink')
      .populate('user');
    res.status(200).json(inkInUseRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
