// requestController.js
import PrinterModel from '../model/printerModel.js';
import Inventory from '../model/inventory.js';
import InkRequest from '../model/ink_requests.js';
import InkInUse from '../model/ink_in_use.js';
import InkIssuance from '../model/ink_issuance.js';
import InkModel from '../model/inkModels.js';
import { deductFromInkInUse } from './inkUsageHelper.js';

export const submitInkRequest = async (req, res) => {
  try {
    const { printerId, ink_type } = req.body;
    const userId = (req.user && req.user.id) || "000000000000000000000001";

    // Look up the selected printer and populate its compatible_inks.
    const printer = await PrinterModel.findById(printerId).populate('compatible_inks');
    if (!printer) {
      return res.status(404).json({ error: 'Printer not found' });
    }

    const requestedInkType = ink_type || "black";
    let selectedInkModel;

    if (requestedInkType === "black") {
      // Choose an InkModel that includes "black" in its colors.
      selectedInkModel = printer.compatible_inks.find(model =>
        model.colors.map(c => c.toLowerCase()).includes("black")
      );
    } else if (requestedInkType === "colored") {
      // Choose an InkModel that has at least one color that is not "black".
      selectedInkModel = printer.compatible_inks.find(model =>
        model.colors.some(c => c.toLowerCase() !== "black")
      );
    }

    if (!selectedInkModel) {
      return res.status(400).json({ error: 'No compatible ink model found for the selected printer and ink type.' });
    }

    // Find an Inventory record for the selected InkModel with available stock.
    const inventoryRecord = await Inventory.findOne({
      ink_model: selectedInkModel._id,
      quantity: { $gt: 0 }
    });
    if (!inventoryRecord) {
      return res.status(400).json({ error: 'No available inventory for the selected ink model.' });
    }

    // Create a new InkRequest referencing this Inventory record.
    const newRequest = new InkRequest({
      ink: inventoryRecord._id,
      requested_by: userId,
      quantity_requested: 1,
      ink_type: requestedInkType
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
export const adminApprovalAndIssuance = async (req, res) => {
  try {
    const { requestId, action, consumptionStatus } = req.body;
    const adminId = req.user.id;

    // Populate the ink field and its referenced ink_model.
    const request = await InkRequest.findById(requestId).populate({
      path: 'ink',
      populate: { path: 'ink_model' }
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    // Check if the Inventory record is present and populated.
    if (!request.ink || !request.ink.ink_model) {
      return res.status(400).json({ error: 'Inventory record or its ink model is not assigned to this request.' });
    }
    if (request.supervisor_approval !== 'Approved') {
      return res.status(400).json({ error: 'Request has not been approved by supervisor' });
    }
    if (request.admin_approval !== 'Pending') {
      return res.status(400).json({ error: 'Request already processed by admin' });
    }

    // Validate consumptionStatus based on ink type.
    if (request.ink_type === 'black') {
      if (typeof consumptionStatus !== 'string') {
        return res.status(400).json({ error: 'For black ink requests, consumptionStatus must be a string.' });
      }
    } else if (request.ink_type === 'colored') {
      if (typeof consumptionStatus !== 'object' || Array.isArray(consumptionStatus)) {
        return res.status(400).json({ error: 'For colored ink requests, consumptionStatus must be an object mapping each color to its status.' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid ink type' });
    }

    // Set admin approval fields.
    request.admin_approval = action === 'Approve' ? 'Approved' : 'Rejected';
    request.admin_by = adminId;
    request.admin_date = new Date();

    if (action === 'Reject') {
      request.status = 'Rejected';
      await request.save();
      return res.status(200).json(request);
    }

    // Mark as approved to proceed with issuance.
    request.status = 'Approved';
    await request.save();

    if (request.ink_type === 'black') {
      const inkId = request.ink._id;
      const quantityRequested = request.quantity_requested; // always 1
      let remainingToDeduct = quantityRequested;
      let issuedFrom = '';

      // Combined Availability Check:
      let inkInUseRecord = await InkInUse.findOne({ ink: inkId, status: 'In Use' });
      let inkInUseAvailable = inkInUseRecord ? inkInUseRecord.quantity_used : 0;
      const inventoryRecord = await Inventory.findById(inkId);
      let inventoryAvailable = inventoryRecord ? inventoryRecord.quantity : 0;
      if (inkInUseAvailable + inventoryAvailable < quantityRequested) {
        return res.status(400).json({ error: 'Insufficient total stock (Ink In Use + Inventory) for issuance.' });
      }

      // Deduct from Ink In Use using helper.
      const { remaining, source } = await deductFromInkInUse(inkId, quantityRequested);
      remainingToDeduct = remaining;
      issuedFrom = source;

      // If needed, deduct remaining amount from Inventory.
      if (remainingToDeduct > 0) {
        if (!inventoryRecord || inventoryRecord.quantity < remainingToDeduct) {
          return res.status(400).json({ error: 'Insufficient stock in inventory for issuance.' });
        }
        inventoryRecord.quantity -= remainingToDeduct;
        await inventoryRecord.save();
        if (!issuedFrom) {
          issuedFrom = 'Inventory';
        }
      }

      // Create a single issuance record for black ink.
      const issuance = new InkIssuance({
        request: request._id,
        ink: inkId,
        issued_quantity: quantityRequested,
        issued_to: request.requested_by,
        issued_by: adminId,
        issue_date: new Date(),
        source: issuedFrom
      });
      await issuance.save();

      // Update consumption_status and mark request as fulfilled.
      request.consumption_status = consumptionStatus; // e.g., "Fully Used" or "Partially Used"
      request.status = 'Fulfilled';
      await request.save();

      return res.status(200).json({
        request,
        issuance,
        message: 'Black ink issuance processed successfully.'
      });
    } else if (request.ink_type === 'colored') {
      // Process for colored ink.
      const inkModel = request.ink.ink_model;
      // Exclude black.
      const colorOptions = inkModel.colors.filter(color => color.toLowerCase() !== 'black');
      const issuanceRecords = [];
    
      // Loop over each available color.
      for (let color of colorOptions) {
        // Find an Inventory batch for this ink model and matching color with at least 1 unit.
        const batch = await Inventory.findOne({ ink_model: inkModel._id, color: color });
        if (!batch || batch.quantity < 1) {
          return res.status(400).json({ error: `Insufficient stock for ${color} ink in Inventory.` });
        }
    
        let remainingToDeduct = 1; // Each request is for 1 unit per color.
        let sourceUsed = '';
    
        // Check for an Ink In Use record for this batch and color.
        let coloredInkInUse = await InkInUse.findOne({ ink: batch._id, color: color, status: 'In Use' });
        if (coloredInkInUse) {
          if (coloredInkInUse.quantity_used >= remainingToDeduct) {
            coloredInkInUse.quantity_used -= remainingToDeduct;
            sourceUsed = 'Ink In Use';
            remainingToDeduct = 0;
            if (coloredInkInUse.quantity_used === 0) {
              coloredInkInUse.status = 'Transferred';
            }
            await coloredInkInUse.save();
          } else {
            remainingToDeduct -= coloredInkInUse.quantity_used;
            coloredInkInUse.quantity_used = 0;
            coloredInkInUse.status = 'Transferred';
            sourceUsed = 'Ink In Use + Inventory';
            await coloredInkInUse.save();
          }
        }
    
        // If there's still amount to deduct, deduct from Inventory.
        if (remainingToDeduct > 0) {
          if (batch.quantity < remainingToDeduct) {
            return res.status(400).json({ error: `Insufficient stock for ${color} ink in Inventory.` });
          }
          batch.quantity -= remainingToDeduct;
          await batch.save();
          if (!sourceUsed) {
            sourceUsed = 'Inventory';
          }
        }
    
        // Now, before finalizing, if the admin indicates that this color was only "Partially Used",
        // then record that remaining ink as an Ink In Use entry.
        if (consumptionStatus[color] === "Partially Used") {
          // You can decide how to determine the remaining quantity.
          // Here, we assume that 1 unit was requested, and if partially used,
          // we record that 1 unit is now "in use" (i.e. not fully consumed).
          const newInkInUse = new InkInUse({
            ink: batch._id,
            user: request.requested_by, // or admin, depending on your logic
            department: "Default", // Replace with actual department if needed
            quantity_used: 1, // Record that 1 unit remains in use.
            color: color,
            status: 'In Use'
          });
          await newInkInUse.save();
        }
    
        // Create an issuance record for this color.
        const issuanceRecord = new InkIssuance({
          request: request._id,
          ink: batch._id,
          issued_quantity: 1,
          issued_to: request.requested_by,
          issued_by: adminId,
          issue_date: new Date(),
          source: sourceUsed
        });
        await issuanceRecord.save();
        issuanceRecords.push(issuanceRecord);
      }
    
      // For colored requests, store the consumptionStatus object.
      request.consumption_status = consumptionStatus;
      request.status = 'Fulfilled';
      await request.save();
    
      return res.status(200).json({
        request,
        issuance: issuanceRecords,
        message: 'Colored ink issuance processed successfully (excluding Black).'
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
