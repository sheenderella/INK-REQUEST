// requestController.js
import PrinterModel from '../model/printerModel.js';
import Inventory from '../model/inventory.js';
import InkRequest from '../model/ink_requests.js';
import InkInUse from '../model/ink_in_use.js';
import InkIssuance from '../model/ink_issuance.js';
import InkModel from '../model/inkModels.js';
import { deductFromInkInUse } from './inkUsageHelper.js';


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

    const inventoryRecord = await Inventory.findOne({
      ink_model: selectedInkModel._id,
      quantity: { $gt: 0 }
    });

    if (!inventoryRecord) {
      return res.status(400).json({ error: 'No available inventory for the selected ink model.' });
    }


    let supervisorApproval = "Pending";
    let adminApproval = "Pending";

    if (userRole === "supervisor") {
      supervisorApproval = "Approved"; 
    } else if (userRole === "admin") {
      supervisorApproval = "Approved"; 
      adminApproval = "Pending"; 
    }

    const newRequest = new InkRequest({
      ink: inventoryRecord._id,
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
      admin_approval: 'Pending'
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
    const { requestId, action } = req.body;
    const adminId = req.user.id;

    const request = await InkRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.supervisor_approval !== 'Approved') {
      return res.status(400).json({ error: 'Request has not been approved by supervisor' });
    }

    if (request.admin_approval !== 'Pending') {
      return res.status(400).json({ error: 'Request already processed by admin' });
    }

    // Match the strings sent from the UI
    if (action === 'Approved') {
      request.admin_approval = 'Approved';
      request.status = 'Approved';
    } else if (action === 'Rejected') {
      request.admin_approval = 'Rejected';
      request.status = 'Rejected';
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    request.admin_by = adminId;
    request.admin_date = new Date();

    await request.save();
    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



// Route for issuing ink (fulfillment)
export const adminIssuance = async (req, res) => {
  try {
    const { requestId, consumptionStatus } = req.body;
    const adminId = req.user.id;

    const request = await InkRequest.findById(requestId).populate({
      path: 'ink',
      populate: { path: 'ink_model' }
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'Approved') {
      return res.status(400).json({ error: 'Request has not been approved by admin yet' });
    }

    if (request.ink_type === 'black' && typeof consumptionStatus !== 'string') {
      return res.status(400).json({ error: 'For black ink requests, consumptionStatus must be a string.' });
    } else if (request.ink_type === 'colored' && typeof consumptionStatus !== 'object') {
      return res.status(400).json({ error: 'For colored ink requests, consumptionStatus must be an object mapping each color to its status.' });
    }

    request.consumption_status = consumptionStatus;
    request.status = 'Fulfilled';

    await request.save();

    // Perform issuance logic for black or colored ink
    // You can reuse your logic for handling the ink issuance here.

    return res.status(200).json({
      request,
      message: 'Ink issuance processed successfully.'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



// export const adminApprovalAndIssuance = async (req, res) => {
//   try {
//     const { requestId, action, consumptionStatus } = req.body;
//     const adminId = req.user.id;

//     console.log('Received requestId:', requestId);
//     console.log('Action:', action);
//     console.log('Consumption Status:', consumptionStatus);
    

//     const request = await InkRequest.findById(requestId).populate({
//       path: 'ink',
//       populate: { path: 'ink_model' }
//     });

//     if (!request) {
//       return res.status(404).json({ error: 'Request not found' });
//     }
//     if (!request.ink || !request.ink.ink_model) {
//       return res.status(400).json({ error: 'Inventory record or its ink model is not assigned to this request.' });
//     }
//     if (request.supervisor_approval !== 'Approved') {
//       return res.status(400).json({ error: 'Request has not been approved by supervisor' });
//     }
//     if (request.admin_approval !== 'Pending') {
//       return res.status(400).json({ error: 'Request already processed by admin' });
//     }

//     if (request.ink_type === 'black') {
//       if (typeof consumptionStatus !== 'string') {
//         return res.status(400).json({ error: 'For black ink requests, consumptionStatus must be a string.' });
//       }
//     } else if (request.ink_type === 'colored') {
//       if (typeof consumptionStatus !== 'object' || Array.isArray(consumptionStatus)) {
//         return res.status(400).json({ error: 'For colored ink requests, consumptionStatus must be an object mapping each color to its status.' });
//       }
//     } else {
//       return res.status(400).json({ error: 'Invalid ink type' });
//     }

//     request.admin_approval = action === 'Approve' ? 'Approved' : 'Rejected';
//     request.admin_by = adminId;
//     request.admin_date = new Date();

//     if (action === 'Reject') {
//       request.status = 'Rejected';
//       await request.save();
//       return res.status(200).json(request);
//     }

//     request.status = 'Approved';
//     await request.save();

//     if (request.ink_type === 'black') {
//       const inkId = request.ink._id;
//       const quantityRequested = request.quantity_requested; 
//       let remainingToDeduct = quantityRequested;
//       let issuedFrom = '';

 
//       let inkInUseRecord = await InkInUse.findOne({ ink: inkId, status: 'In Use' });
//       let inkInUseAvailable = inkInUseRecord ? inkInUseRecord.quantity_used : 0;
//       const inventoryRecord = await Inventory.findById(inkId);
//       let inventoryAvailable = inventoryRecord ? inventoryRecord.quantity : 0;
//       if (inkInUseAvailable + inventoryAvailable < quantityRequested) {
//         return res.status(400).json({ error: 'Insufficient total stock (Ink In Use + Inventory) for issuance.' });
//       }


//       const { remaining, source } = await deductFromInkInUse(inkId, quantityRequested);
//       remainingToDeduct = remaining;
//       issuedFrom = source;

    
//       if (remainingToDeduct > 0) {
//         if (!inventoryRecord || inventoryRecord.quantity < remainingToDeduct) {
//           return res.status(400).json({ error: 'Insufficient stock in inventory for issuance.' });
//         }
//         inventoryRecord.quantity -= remainingToDeduct;
//         await inventoryRecord.save();
//         if (!issuedFrom) {
//           issuedFrom = 'Inventory';
//         }
//       }

    
//       const issuance = new InkIssuance({
//         request: request._id,
//         ink: inkId,
//         issued_quantity: quantityRequested,
//         issued_to: request.requested_by,
//         issued_by: adminId,
//         issue_date: new Date(),
//         source: issuedFrom
//       });
//       await issuance.save();

 
//       request.consumption_status = consumptionStatus;
//       request.status = 'Fulfilled';
//       await request.save();

//       return res.status(200).json({
//         request,
//         issuance,
//         message: 'Black ink issuance processed successfully.'
//       });
//     } else if (request.ink_type === 'colored') {
     
//       const inkModel = request.ink.ink_model;

//       const colorOptions = inkModel.colors.filter(color => color.toLowerCase() !== 'black');
//       const issuanceRecords = [];
    
    
//       for (let color of colorOptions) {

//         const batch = await Inventory.findOne({ ink_model: inkModel._id, color: color });
//         if (!batch || batch.quantity < 1) {
//           return res.status(400).json({ error: `Insufficient stock for ${color} ink in Inventory.` });
//         }
    
//         let remainingToDeduct = 1;
//         let sourceUsed = '';
    

//         let coloredInkInUse = await InkInUse.findOne({ ink: batch._id, color: color, status: 'In Use' });
//         if (coloredInkInUse) {
//           if (coloredInkInUse.quantity_used >= remainingToDeduct) {
//             coloredInkInUse.quantity_used -= remainingToDeduct;
//             sourceUsed = 'Ink In Use';
//             remainingToDeduct = 0;
//             if (coloredInkInUse.quantity_used === 0) {
//               coloredInkInUse.status = 'Transferred';
//             }
//             await coloredInkInUse.save();
//           } else {
//             remainingToDeduct -= coloredInkInUse.quantity_used;
//             coloredInkInUse.quantity_used = 0;
//             coloredInkInUse.status = 'Transferred';
//             sourceUsed = 'Ink In Use + Inventory';
//             await coloredInkInUse.save();
//           }
//         }
    
     
//         if (remainingToDeduct > 0) {
//           if (batch.quantity < remainingToDeduct) {
//             return res.status(400).json({ error: `Insufficient stock for ${color} ink in Inventory.` });
//           }
//           batch.quantity -= remainingToDeduct;
//           await batch.save();
//           if (!sourceUsed) {
//             sourceUsed = 'Inventory';
//           }
//         }
    

//         if (consumptionStatus[color] === "Partially Used") {

//           const newInkInUse = new InkInUse({
//             ink: batch._id,
//             user: request.requested_by, 
//             department: "Default", 
//             quantity_used: 1, 
//             color: color,
//             status: 'In Use'
//           });
//           await newInkInUse.save();
//         }
    
 
//         const issuanceRecord = new InkIssuance({
//           request: request._id,
//           ink: batch._id,
//           issued_quantity: 1,
//           issued_to: request.requested_by,
//           issued_by: adminId,
//           issue_date: new Date(),
//           source: sourceUsed
//         });
//         await issuanceRecord.save();
//         issuanceRecords.push(issuanceRecord);
//       }
    
  
//       request.consumption_status = consumptionStatus;
//       request.status = 'Fulfilled';
//       await request.save();
    
//       return res.status(200).json({
//         request,
//         issuance: issuanceRecords,
//         message: 'Colored ink issuance processed successfully (excluding Black).'
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };


