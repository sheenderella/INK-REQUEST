import express from 'express';
// For production, uncomment token verification middleware.
// import { verifyToken } from '../middleware/authMiddleware.js';
import {
  submitInkRequest,
  getPendingSupervisorRequests,
  supervisorApproval,
  getPendingAdminRequests,
  adminApprovalAndIssuance
} from '../controller/requestController.js';

const router = express.Router();

// Dummy middleware for testing (sets req.user)
router.use((req, res, next) => {
  req.user = { id: "000000000000000000000001" }; // Valid dummy ObjectId
  next();
});

// Endpoints:
router.post('/ink/request', submitInkRequest);
router.get('/ink/supervisor/requests', getPendingSupervisorRequests);
router.post('/ink/supervisor', supervisorApproval);
router.get('/ink/admin/requests', getPendingAdminRequests);
router.post('/ink/admin', adminApprovalAndIssuance);

export default router;
