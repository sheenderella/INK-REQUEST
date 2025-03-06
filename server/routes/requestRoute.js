import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  submitInkRequest,
  getPendingSupervisorRequests,
  supervisorApproval,
  getPendingAdminRequests,
  adminApproval,
  adminIssuance,
  // adminApprovalAndIssuance,

  getUserRequests 
} from '../controller/requestController.js';

const router = express.Router();

router.post('/ink/request', verifyToken, submitInkRequest);
router.get('/ink/supervisor/requests', verifyToken, getPendingSupervisorRequests);
router.post('/ink/supervisor', verifyToken, supervisorApproval);
router.get('/ink/admin/requests', verifyToken, getPendingAdminRequests);
// router.post('/ink/admin', verifyToken, adminApprovalAndIssuance);
router.get('/ink/requests/:userId', verifyToken, getUserRequests);


router.post('/ink/admin/approval', verifyToken, adminApproval); 
router.post('/ink/admin/issuance', verifyToken, adminIssuance); 

export default router;
