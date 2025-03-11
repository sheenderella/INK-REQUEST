import InkInUse from '../model/ink_in_use.js';

export const getInkInUseRecords = async (req, res) => {
    try {
      const { inkId } = req.query;
      let query = {};
      if (inkId) {
        query.ink = inkId;
      }
      const records = await InkInUse.find(query).populate('ink user');
      res.json(records);
    } catch (error) {
      console.error('Error fetching InkInUse records:', error);
      res.status(500).json({ message: 'Server error fetching records' });
    }
  };
  