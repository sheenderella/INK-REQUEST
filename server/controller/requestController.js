import Inventory from '../model/inventory.js';
import InkRequest from '../model/ink_requests.js';
import InkInUse from '../model/ink_in_use.js';
import InkIssuance from '../model/ink_issuance.js';

/**
 * Employee submits a new ink request.
 * Expected req.body: { inkId, quantity }
 * Assumes req.user contains authenticated user data.
 */
export const submitInkRequest = async (req, res) => {
  try {
    const { inkId, quantity } = req.body;
    const userId = (req.user && req.user.id) || "000000000000000000000001";

    const newRequest = new InkRequest({
      ink: inkId,
      requested_by: userId,
      quantity_requested: quantity,
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Supervisor fetches pending requests.
 */
export const getPendingSupervisorRequests = async (req, res) => {
  try {
    const pendingRequests = await InkRequest.find({ supervisor_approval: 'Pending' })
      .populate('ink')
      .populate('requested_by');
    res.status(200).json(pendingRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Supervisor approves or rejects a request.
 * Expected req.body: { requestId, action } where action is 'Approve' or 'Reject'
 */
export const supervisorApproval = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    const supervisorId = req.user.id;

    const request = await InkRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (request.supervisor_approval !== 'Pending') {
      return res.status(400).json({ error: 'Request already processed by supervisor' });
    }

    request.supervisor_approval = action === 'Approve' ? 'Approved' : 'Rejected';
    request.supervisor_by = supervisorId;
    request.supervisor_date = new Date();

    if (action === 'Reject') {
      request.status = 'Rejected';
    }

    await request.save();
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Admin fetches requests approved by the supervisor and pending admin action.
 */
export const getPendingAdminRequests = async (req, res) => {
  try {
    const pendingRequests = await InkRequest.find({
      supervisor_approval: 'Approved',
      admin_approval: 'Pending'
    })
      .populate('ink')
      .populate('requested_by');
    res.status(200).json(pendingRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Admin approval and issuance process.
 * Expected req.body: { requestId, action, consumptionStatus, remainingQuantity }
 */
export const adminApprovalAndIssuance = async (req, res) => {
  try {
    const { requestId, action, consumptionStatus, remainingQuantity } = req.body;
    const adminId = req.user.id;

    const request = await InkRequest.findById(requestId).populate('ink');
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (request.supervisor_approval !== 'Approved') {
      return res.status(400).json({ error: 'Request has not been approved by supervisor' });
    }
    if (request.admin_approval !== 'Pending') {
      return res.status(400).json({ error: 'Request already processed by admin' });
    }

    request.admin_approval = action === 'Approve' ? 'Approved' : 'Rejected';
    request.admin_by = adminId;
    request.admin_date = new Date();

    if (action === 'Reject') {
      request.status = 'Rejected';
      await request.save();
      return res.status(200).json(request);
    }

    request.status = 'Approved';
    await request.save();

    const inkId = request.ink._id;
    const quantityRequested = request.quantity_requested;
    let remainingToDeduct = quantityRequested;

    const inkInUseRecord = await InkInUse.findOne({ ink: inkId, status: 'In Use' });
    if (inkInUseRecord && inkInUseRecord.quantity_used > 0) {
      if (inkInUseRecord.quantity_used >= remainingToDeduct) {
        inkInUseRecord.quantity_used -= remainingToDeduct;
        remainingToDeduct = 0;
        await inkInUseRecord.save();
      } else {
        remainingToDeduct -= inkInUseRecord.quantity_used;
        inkInUseRecord.quantity_used = 0;
        await inkInUseRecord.save();
      }
    }

    if (remainingToDeduct > 0) {
      const inventoryRecord = await Inventory.findById(inkId);
      if (!inventoryRecord || inventoryRecord.quantity < remainingToDeduct) {
        return res.status(400).json({ error: 'Insufficient stock in inventory for issuance.' });
      }
      inventoryRecord.quantity -= remainingToDeduct;
      await inventoryRecord.save();
    }

    const issuance = new InkIssuance({
      request: request._id,
      ink: inkId,
      issued_quantity: quantityRequested,
      issued_to: request.requested_by,
      issued_by: adminId,
      issue_date: new Date()
    });
    await issuance.save();

    request.status = 'Fulfilled';
    request.consumption_status = consumptionStatus;
    request.remaining_quantity = consumptionStatus === 'Partially Used' ? remainingQuantity : 0;
    await request.save();

    if (consumptionStatus === 'Partially Used') {
      const existingInkInUse = await InkInUse.findOne({ ink: inkId, status: 'In Use' });
      if (existingInkInUse) {
        existingInkInUse.quantity_used += remainingQuantity;
        await existingInkInUse.save();
      } else {
        const newInkInUse = new InkInUse({
          ink: inkId,
          user: request.requested_by,
          department: 'Unknown',
          quantity_used: remainingQuantity,
          status: 'In Use',
          assigned_date: new Date()
        });
        await newInkInUse.save();
      }
    }

    res.status(200).json({
      request,
      issuance,
      message: 'Ink issuance processed successfully.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
