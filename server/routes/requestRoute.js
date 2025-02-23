import express from 'express';
// For production, uncomment the next line and remove the dummy middleware below:
// import { verifyToken } from '../middleware/authMiddleware.js';
import {
  submitInkRequest,
  getPendingSupervisorRequests,
  supervisorApproval,
  getPendingAdminRequests,
  adminApprovalAndIssuance
} from '../controller/requestController.js';

const router = express.Router();

// Dummy middleware for testing without tokens.
// Use a valid dummy ObjectId for testing.
router.use((req, res, next) => {
  req.user = { id: "000000000000000000000001" };
  next();
});

// In production, replace the dummy middleware with the following:
// router.use(verifyToken);

// Endpoints:
router.post('/ink/request', submitInkRequest);
router.get('/ink/supervisor/requests', getPendingSupervisorRequests);
router.post('/ink/supervisor', supervisorApproval);
router.get('/ink/admin/requests', getPendingAdminRequests);
router.post('/ink/admin', adminApprovalAndIssuance);

export default router;
