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


const fetchRequest = async (requestId) => {
  console.log(`Fetching request with ID: ${requestId}`);
  return await InkRequest.findById(requestId)
    .populate({
      path: 'ink',
      populate: { path: 'ink_model', select: 'ink_name colors' }
    })
    .populate('requested_by', 'department');
};

const determineInventoryRecord = async (request) => {
  console.log('Determining inventory record and ink model');
  let inventoryRecord, inkModel;
  if (Array.isArray(request.ink)) {
    console.log('Request contains an array of ink.');
    if (request.ink.length === 0 || !request.ink[0].ink_model) {
      console.log('No ink model assigned to the request.');
      return {};
    }
    inventoryRecord = request.ink[0];
    inkModel = inventoryRecord.ink_model;
  } else {
    if (!request.ink.ink_model) {
      console.log('No ink model assigned to the request.');
      return {};
    }
    inventoryRecord = request.ink;
    inkModel = request.ink.ink_model;
  }
  console.log(`Found inventory record with ID: ${inventoryRecord._id}, Ink model: ${inkModel}`);
  return { inventoryRecord, inkModel };
};

const markRequestApproved = async (request) => {
  console.log('Marking request as approved if not already.');
  if (request.status !== 'Approved') {
    console.log('Request status is not "Approved", updating.');
    request.status = 'Approved';
    request.admin_approval = 'Approved';
    await request.save();
  } else {
    console.log('Request already marked as approved.');
  }
};


const handleExistingConsumptionStatus = async (request) => {
  console.log('Checking existing consumption status.');
  if (request.consumption_status && Object.keys(request.consumption_status).length > 0 && request.consumption_status !== "Not Processed") {
    console.log('Consumption already processed, marking request as Fulfilled.');
    request.status = 'Fulfilled';
    await request.save();
    return true;
  }
  return false;
};


const validateConsumptionStatus = (request, consumptionStatus) => {
  console.log('Validating consumption status format.');
  if (request.ink_type === 'black' && typeof consumptionStatus !== 'string') {
    console.log('Invalid consumption status for black ink.');
    return false;
  } else if (request.ink_type === 'colored' && (typeof consumptionStatus !== 'object' || Array.isArray(consumptionStatus))) {
    console.log('Invalid consumption status for colored ink.');
    return false;
  }
  return true;
};


const handleBlackInk = async (request, inkModel, consumptionStatus, adminId) => {
  console.log(`Handling black ink for request: ${request._id}`);

  // Log the entire consumptionStatus to check its structure
  console.log('Consumption status object:', consumptionStatus);

  // Check for inventory of black ink
  const batch = await Inventory.findOne({ ink_model: inkModel._id, color: 'Black' });
  if (!batch || batch.quantity < 1) {
    console.log('Insufficient stock for black ink in Inventory.');
    return { error: 'Insufficient stock for black ink in Inventory.' };
  }

  let remainingToDeduct = 1;
  let sourceUsed = '';
  
// Look for existing 'In Use' record for black ink
const blackInkInUse = await InkInUse.findOne({ ink: batch._id, color: 'Black', status: 'In Use' });

if (blackInkInUse && blackInkInUse.quantity_used > 0) {
    console.log(`Existing black ink in use: Deducting ${remainingToDeduct} from ink in use.`);
    blackInkInUse.quantity_used -= remainingToDeduct;  // Deduct the used quantity
    await blackInkInUse.save();
}


  // Log to check the status of existing blackInkInUse
  console.log('Existing blackInkInUse record:', blackInkInUse);

  // Check the consumptionStatus for black ink
  let blackInkStatus = consumptionStatus;
  
  // If the consumptionStatus is an object (for colored inks), get the value for black ink
  if (typeof consumptionStatus === 'object' && consumptionStatus['Black']) {
    blackInkStatus = consumptionStatus['Black'];
  }
  
  console.log(`Checking consumptionStatus for black ink: ${blackInkStatus}`);

  // Check if the consumption status is 'Partially Used', then create a new Ink In Use record
  if (blackInkStatus === "Partially Used" && !(blackInkInUse && blackInkInUse.status === 'Used')) {
    console.log('Creating a new Ink In Use record for black ink.');

    const newInkInUse = new InkInUse({
      ink: batch._id,
      user: request.requested_by,
      department: request.requested_by.department || "Default",
      quantity_used: remainingToDeduct,
      color: 'Black',
      status: 'In Use'
    });

    await newInkInUse.save();
  } else {
    console.log('Condition for creating new Ink In Use record for black ink not met.');
  }

  // If an existing Ink In Use record exists and consumption is not 'Used', update it
  if (blackInkInUse && blackInkInUse.status !== 'Used') {
    console.log('Updating existing Ink In Use record for black ink.');
    blackInkInUse.quantity_used += remainingToDeduct;  // Add to existing Ink In Use record
    await blackInkInUse.save();
  }

  // Deduct remaining amount from Inventory if needed
  if (remainingToDeduct > 0) {
    console.log(`Deducting ${remainingToDeduct} from inventory for black ink.`);
    if (batch.quantity < remainingToDeduct) {
      return { error: 'Insufficient stock for black ink in Inventory.' };
    }
    batch.quantity -= remainingToDeduct;
    await batch.save();
    if (!sourceUsed) {
      sourceUsed = 'Inventory';
    }
  }

  // Create issuance record for black ink
  console.log('Creating issuance record for black ink.');
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

  console.log('Updating request consumption status to Fulfilled for black ink.');
  request.consumption_status = consumptionStatus;
  request.status = 'Fulfilled';
  await request.save();

  return {
    request,
    issuance: [issuanceRecord],
    message: 'Black ink issuance processed successfully and request marked as Fulfilled.'
  };
};


const handleColoredInk = async (request, inkModel, consumptionStatus, adminId) => {
  console.log(`Handling colored ink for request: ${request._id}`);
  const colorOptions = inkModel.colors.filter(color => color.toLowerCase() !== 'black');
  const issuanceRecords = [];

  for (let color of colorOptions) {
    console.log(`Checking inventory for color: ${color}`);
    const batch = await Inventory.findOne({ ink_model: inkModel._id, color: color });
    if (!batch || batch.quantity < 1) {
      console.log(`Insufficient stock for ${color} ink in Inventory.`);
      return { error: `Insufficient stock for ${color} ink in Inventory.` };
    }

    let remainingToDeduct = 1;
    let sourceUsed = '';
    // Look for existing 'In Use' record for colored ink
    const coloredInkInUse = await InkInUse.findOne({ ink: batch._id, color: color, status: 'In Use' });

    if (coloredInkInUse && coloredInkInUse.quantity_used > 0) {
        console.log(`Existing colored ink in use: Deducting ${remainingToDeduct} from ink in use.`);
        coloredInkInUse.quantity_used -= remainingToDeduct;  // Deduct the used quantity
        await coloredInkInUse.save();
    }


    console.log(`Checking consumptionStatus for color ${color}: ${consumptionStatus[color]}`);

    // Check if the consumption status is 'Partially Used', then create a new Ink In Use record
    if (consumptionStatus[color] === "Partially Used" && !(coloredInkInUse && coloredInkInUse.status === 'Used')) {
      console.log(`Creating a new Ink In Use record for ${color}.`);
      const newInkInUse = new InkInUse({
        ink: batch._id,
        user: request.requested_by,
        department: request.requested_by.department || "Default",
        quantity_used: remainingToDeduct,
        color: color,
        status: 'In Use'
      });
      await newInkInUse.save();
    }

    // If an existing Ink In Use record exists and consumption is not 'Used', update it
    if (coloredInkInUse && coloredInkInUse.status !== 'Used') {
      console.log(`Updating existing Ink In Use record for ${color}.`);
      coloredInkInUse.quantity_used += remainingToDeduct;  // Add to existing Ink In Use record
      await coloredInkInUse.save();
    }

    // Deduct remaining amount from Inventory if needed
    if (remainingToDeduct > 0) {
      console.log(`Deducting ${remainingToDeduct} from inventory for ${color}.`);
      if (batch.quantity < remainingToDeduct) {
        return { error: `Insufficient stock for ${color} ink in Inventory.` };
      }
      batch.quantity -= remainingToDeduct;
      await batch.save();
      if (!sourceUsed) {
        sourceUsed = 'Inventory';
      }
    }

    // Create issuance record for the color
    console.log(`Creating issuance record for color: ${color}`);
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

  console.log('Updating request consumption status to Fulfilled.');
  request.consumption_status = consumptionStatus;
  request.status = 'Fulfilled';
  await request.save();

  return {
    request,
    issuance: issuanceRecords,
    message: `Colored ink issuance processed successfully (excluding Black) and request marked as Fulfilled.`
  };
};


export const adminIssuance = async (req, res) => {
  try {
    console.log('Admin issuance started.');
    const { requestId, consumptionStatus } = req.body;
    const adminId = req.user.userId || req.user.id;

    // Fetch the ink request and populate related fields.
    const request = await fetchRequest(requestId);
    if (!request) {
      console.log('Request not found.');
      return res.status(404).json({ error: 'Request not found' });
    }

    // Determine inventory record and ink model.
    let { inventoryRecord, inkModel } = await determineInventoryRecord(request);
    if (!inventoryRecord || !inkModel) {
      console.log('Inventory record or ink model not assigned.');
      return res.status(400).json({ error: 'Inventory record or ink model not assigned.' });
    }

    // Mark request as approved if not already.
    await markRequestApproved(request);

    // Check for existing consumption status.
    if (await handleExistingConsumptionStatus(request)) {
      return res.status(200).json({
        request,
        message: 'Consumption already rated, request marked as Fulfilled.'
      });
    }

    // Validate consumptionStatus format.
    if (!validateConsumptionStatus(request, consumptionStatus)) {
      console.log('Invalid consumption status format.');
      return res.status(400).json({ error: 'Invalid consumption status format.' });
    }

    // ===== BLACK INK HANDLING =====
    if (request.ink_type.toLowerCase() === 'black') {
      const response = await handleBlackInk(request, inkModel, consumptionStatus, adminId);
      return res.status(200).json(response);
    }

    // ===== COLORED INK HANDLING =====
    if (request.ink_type.toLowerCase() === 'colored') {
      const response = await handleColoredInk(request, inkModel, consumptionStatus, adminId);
      return res.status(200).json(response);
    }
  } catch (error) {
    console.error('Error in adminIssuance:', error);
    return res.status(500).json({ error: error.message });
  }
};
