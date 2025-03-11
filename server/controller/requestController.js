// requestController.js
import PrinterModel from '../model/printerModel.js';

import Inventory from '../model/inventory.js';
import InkRequest from '../model/ink_requests.js';
import InkInUse from '../model/ink_in_use.js';
import InkIssuance from '../model/ink_issuance.js';
import InkModel from '../model/inkModels.js';


export const getUserRequests = async (req, res) => {
  try {
    const userId = req.params.userId;

    const userRequests = await InkRequest.find({ requested_by: userId })
      .select('_id request_date supervisor_approval admin_approval status') 
      .populate('requested_by'); 

    res.status(200).json(userRequests);
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ error: error.message });
  }
};

export const submitInkRequest = async (req, res) => {
  try {
    const { printerId, ink_type, userId } = req.body;
    const userIdFromToken = req.user?.userId || req.user?.id; // Ensure ID is fetched correctly
    const userRole = req.user?.role?.toLowerCase(); // Make role case-insensitive

    console.log("Received Printer ID:", printerId);
    console.log("Received Ink Type:", ink_type);
    console.log("Received User ID from Frontend:", userId);
    console.log("User ID from Token:", userIdFromToken);
    console.log("User Role:", userRole);

    if (!userIdFromToken) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token or session expired.' });
    }

    if (!ink_type) {
      return res.status(400).json({ error: 'Ink type is required. Please select an ink type.' });
    }

    const printer = await PrinterModel.findById(printerId).populate('compatible_inks');
    if (!printer) {
      return res.status(404).json({ error: 'Printer not found' });
    }

    console.log("Printer Document:", printer);
    console.log("Compatible Inks:", printer.compatible_inks);

    const selectedInkModel = printer.compatible_inks[0];
    if (!selectedInkModel) {
      return res.status(400).json({ error: 'No compatible ink model found for the selected printer.' });
    }

    let inventoryData;
    if (ink_type === 'black') {
      // For black ink, select the inventory record with color "Black"
      const blackInventory = await Inventory.findOne({
        ink_model: selectedInkModel._id,
        color: 'Black',
        quantity: { $gt: 0 }
      });
      if (!blackInventory) {
        return res.status(400).json({ error: 'No available black ink inventory for the selected ink model.' });
      }
      // For black ink, we store a single inventory ID
      inventoryData = blackInventory._id;
    } else if (ink_type === 'colored') {
      // For colored ink, select all available records where color is not "Black"
      const coloredInventories = await Inventory.find({
        ink_model: selectedInkModel._id,
        color: { $ne: 'Black' },
        quantity: { $gt: 0 }
      });
      if (!coloredInventories || coloredInventories.length === 0) {
        return res.status(400).json({ error: 'No available colored ink inventory for the selected ink model.' });
      }
      // Store an array of inventory IDs for colored ink
      inventoryData = coloredInventories.map(record => record._id);
    } else {
      return res.status(400).json({ error: 'Invalid ink type provided.' });
    }

    let supervisorApproval = "Pending";
    let adminApproval = "Pending";

    if (userRole === "supervisor") {
      supervisorApproval = "Approved"; 
    } else if (userRole === "admin") {
      supervisorApproval = "Approved"; 
      adminApproval = "Pending"; 
    }

    // Create the new ink request. For colored ink, `ink` will be an array of IDs.
    const newRequest = new InkRequest({
      ink: inventoryData,
      requested_by: userIdFromToken || userId, 
      quantity_requested: 1,
      ink_type: ink_type,
      supervisor_approval: supervisorApproval,
      admin_approval: adminApproval,
      status: "Pending",
      consumption_status: "Not Processed",
      request_date: new Date()
    });

    const savedRequest = await newRequest.save();
    console.log("Request successfully saved:", savedRequest);

    res.status(201).json(savedRequest);
  } catch (error) {
    console.error('Error in submitting ink request:', error);
    res.status(500).json({ error: error.message });
  }
};


export const getPendingSupervisorRequests = async (req, res) => {
  try {
    const supervisorDept = req.user.department;

    const pendingRequests = await InkRequest.find({ supervisor_approval: 'Pending' })
      .populate('ink')
      .populate('requested_by');

    const filteredRequests = pendingRequests.filter(request => {
      return request.requested_by.department === supervisorDept;
    });

    res.status(200).json(filteredRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const supervisorApproval = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    const supervisorId = req.user.id;
    const supervisorDept = req.user.department;

    const request = await InkRequest.findById(requestId).populate('requested_by');
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.requested_by.department !== supervisorDept) {
      return res.status(403).json({ error: 'You are not authorized to approve requests outside your department.' });
    }

    if (request.supervisor_approval !== 'Pending') {
      return res.status(400).json({ error: 'Request already processed by supervisor.' });
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
    console.error('Error in supervisor approval:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getPendingAdminRequests = async (req, res) => {
  try {
    const pendingRequests = await InkRequest.find({
      supervisor_approval: 'Approved',
      admin_approval: { $in: ['Approved', 'Pending'] }
    })
      .populate({
        path: 'ink',
        populate: {
          path: 'ink_model',
          select: 'ink_name'
        }
      })
      .populate('requested_by', 'first_name last_name department')
      .exec();

    console.log('Populated Pending Requests:', pendingRequests);  // Check the data in the logs

    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error('Error fetching admin requests:', error);
    res.status(500).json({ error: error.message });
  }
};

export const adminApproval = async (req, res) => {
  try {
    console.log('Received approval request:', req.body);  // Log the incoming request data

    const { requestId, action } = req.body;
    const adminId = req.user.id;

    const request = await InkRequest.findById(requestId).populate('requested_by', 'department');
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    console.log('Request details:', request);  // Log the request details for debugging

    // Ensure the action is either 'Approved' or 'Rejected'
    if (action !== 'Approved' && action !== 'Rejected') {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Process the approval or rejection based on the action
    if (action === 'Approved') {
      request.admin_approval = 'Approved';
      request.status = 'Approved';
    } else if (action === 'Rejected') {
      request.admin_approval = 'Rejected';
      request.status = 'Rejected';
    }

    request.admin_by = adminId;
    request.admin_date = new Date();
    await request.save();

    return res.status(200).json(request);
  } catch (error) {
    console.error('Error in adminApproval:', error);  // Log the error details
    return res.status(500).json({ error: error.message });
  }
};

export const adminIssuance = async (req, res) => {
  try {
    const { requestId, consumptionStatus } = req.body;
    const adminId = req.user.userId || req.user.id;

    // Fetch the ink request and populate related fields.
    const request = await InkRequest.findById(requestId)
      .populate({
        path: 'ink',
        populate: { path: 'ink_model', select: 'ink_name colors' }
      })
      .populate('requested_by', 'department');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Determine inventory record and ink model.
    let inventoryRecord, inkModel;
    if (Array.isArray(request.ink)) {
      if (request.ink.length === 0 || !request.ink[0].ink_model) {
        return res.status(400).json({ error: 'Inventory record or its ink model is not assigned to this request.' });
      }
      inventoryRecord = request.ink[0];
      inkModel = inventoryRecord.ink_model;
    } else {
      if (!request.ink.ink_model) {
        return res.status(400).json({ error: 'Inventory record or its ink model is not assigned to this request.' });
      }
      inventoryRecord = request.ink;
      inkModel = request.ink.ink_model;
    }

    // Mark request as approved if not already.
    if (request.status !== 'Approved') {
      request.status = 'Approved';
      request.admin_approval = 'Approved';
      await request.save();
    }

    // Check if consumptionStatus already exists. If so, mark as "Fulfilled".
    if (request.consumption_status && Object.keys(request.consumption_status).length > 0 && request.consumption_status !== "Not Processed") {
      // If there's already a consumption status, mark it as Fulfilled
      request.status = 'Fulfilled';
      await request.save();
      return res.status(200).json({
        request,
        message: 'Consumption already rated, request marked as Fulfilled.'
      });
    }

    // Validate consumptionStatus format.
    if (request.ink_type === 'black' && typeof consumptionStatus !== 'string') {
      return res.status(400).json({ error: 'For black ink requests, consumptionStatus must be a string.' });
    } else if (
      request.ink_type === 'colored' &&
      (typeof consumptionStatus !== 'object' || Array.isArray(consumptionStatus))
    ) {
      return res.status(400).json({
        error: 'For colored ink requests, consumptionStatus must be an object mapping each color to its status.'
      });
    }

    // Flag(s) to track if any Ink In Use stock was used or created.
    let usedInkInUse = false;

    // ===== BLACK INK HANDLING =====
    if (request.ink_type.toLowerCase() === 'black') {
      const inkId = inventoryRecord._id;
      const quantityRequested = request.quantity_requested;
      let remainingToDeduct = quantityRequested;
      let issuedFrom = '';

      // Find available Ink In Use record for Black.
      const inkInUseRecord = await InkInUse.findOne({ ink: inkId, status: 'In Use', color: 'Black' });
      const inkInUseAvailable = inkInUseRecord ? inkInUseRecord.quantity_used : 0;
      // Check Inventory.
      const inventoryDoc = await Inventory.findById(inkId);
      const inventoryAvailable = inventoryDoc ? inventoryDoc.quantity : 0;
      if (inkInUseAvailable + inventoryAvailable < quantityRequested) {
        return res.status(400).json({ error: 'Insufficient total stock (Ink In Use + Inventory) for issuance.' });
      }

      // Deduct from Ink In Use (if exists).
      if (inkInUseRecord) {
        usedInkInUse = true;
        if (inkInUseRecord.quantity_used >= remainingToDeduct) {
          inkInUseRecord.quantity_used -= remainingToDeduct;
          issuedFrom = 'Ink In Use';
          remainingToDeduct = 0;
          if (inkInUseRecord.quantity_used === 0) {
            inkInUseRecord.status = 'Transferred';
          }
          await inkInUseRecord.save();
          if (inkInUseRecord.status === 'Transferred' && inkInUseRecord.quantity_used === 0) {
            await InkInUse.findByIdAndDelete(inkInUseRecord._id);
          }
        } else {
          remainingToDeduct -= inkInUseRecord.quantity_used;
          inkInUseRecord.quantity_used = 0;
          inkInUseRecord.status = 'Transferred';
          issuedFrom = 'Ink In Use + Inventory';
          await inkInUseRecord.save();
          if (inkInUseRecord.status === 'Transferred' && inkInUseRecord.quantity_used === 0) {
            await InkInUse.findByIdAndDelete(inkInUseRecord._id);
          }
        }
      }

      // Deduct remaining from Inventory.
      if (remainingToDeduct > 0) {
        if (!inventoryDoc || inventoryDoc.quantity < remainingToDeduct) {
          return res.status(400).json({ error: 'Insufficient stock in inventory for issuance.' });
        }
        inventoryDoc.quantity -= remainingToDeduct;
        await inventoryDoc.save();
        if (!issuedFrom || issuedFrom === 'Ink In Use + Inventory') {
          issuedFrom = 'Inventory';
        }
      }

      // Create an issuance record.
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

      // If consumptionStatus is "Partially Used", create a new Ink In Use record.
      if (consumptionStatus === "Partially Used") {
        usedInkInUse = true;
        const newInkInUse = new InkInUse({
          ink: inkId,
          user: request.requested_by,
          department: req.user.department || request.requested_by.department || "Default",
          quantity_used: 1,
          color: 'Black',
          status: 'In Use'
        });
        await newInkInUse.save();
      }

      // Update the request.
      request.consumption_status = { Black: 'Processed' }; // Mark as Processed after consumption
      request.status = 'Approved'; // Set status to Approved after processing.
      await request.save();

      return res.status(200).json({
        request,
        issuance,
        message: `Black ink issuance processed successfully. Request marked as Approved, waiting for fulfillment.`
      });
    }

    // ===== COLORED INK HANDLING =====
    if (request.ink_type.toLowerCase() === 'colored') {
      const colorOptions = inkModel.colors.filter(color => color.toLowerCase() !== 'black');
      const issuanceRecords = [];
      let anyInkInUseUsed = false;

      for (let color of colorOptions) {
        // Find the inventory batch for the color.
        const batch = await Inventory.findOne({ ink_model: inkModel._id, color: color });
        if (!batch || batch.quantity < 1) {
          return res.status(400).json({ error: `Insufficient stock for ${color} ink in Inventory.` });
        }

        let remainingToDeduct = 1; // Assume quantity per color is 1.
        let sourceUsed = '';

        // Deduct from Ink In Use for this color if record exists.
        const coloredInkInUse = await InkInUse.findOne({ ink: batch._id, color: color, status: 'In Use' });
        if (coloredInkInUse) {
          anyInkInUseUsed = true;
          if (coloredInkInUse.quantity_used >= remainingToDeduct) {
            coloredInkInUse.quantity_used -= remainingToDeduct;
            sourceUsed = 'Ink In Use';
            remainingToDeduct = 0;
            if (coloredInkInUse.quantity_used === 0) {
              coloredInkInUse.status = 'Transferred';
            }
            await coloredInkInUse.save();
            if (coloredInkInUse.status === 'Transferred' && coloredInkInUse.quantity_used === 0) {
              await InkInUse.findByIdAndDelete(coloredInkInUse._id);
            }
          } else {
            remainingToDeduct -= coloredInkInUse.quantity_used;
            coloredInkInUse.quantity_used = 0;
            coloredInkInUse.status = 'Transferred';
            sourceUsed = 'Ink In Use + Inventory';
            await coloredInkInUse.save();
            if (coloredInkInUse.status === 'Transferred' && coloredInkInUse.quantity_used === 0) {
              await InkInUse.findByIdAndDelete(coloredInkInUse._id);
            }
          }
        }

        // Deduct any remaining amount from Inventory.
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

        // For partially used colored ink, create a new Ink In Use record.
        if (consumptionStatus[color] === "Partially Used") {
          anyInkInUseUsed = true;
          const newInkInUse = new InkInUse({
            ink: batch._id,
            user: request.requested_by,
            department: req.user.department || request.requested_by.department || "Default",
            quantity_used: 1,
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

      // Update the request after consumption rating and mark as "Fulfilled".
      request.consumption_status = consumptionStatus;
      request.status = 'Fulfilled'; // Set status to Fulfilled after processing.
      await request.save();

      return res.status(200).json({
        request,
        issuance: issuanceRecords,
        message: `Colored ink issuance processed successfully (excluding Black) and request marked as Fulfilled.`
      });
    }
  } catch (error) {
    console.error('Error in adminIssuance:', error);
    return res.status(500).json({ error: error.message });
  }
};

