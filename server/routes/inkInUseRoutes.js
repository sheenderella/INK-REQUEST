import express from 'express';
// Uncomment the next line for production use with real token verification:
// import { verifyToken } from '../middleware/authMiddleware.js';
import { addInkInUse, getAllInkInUse } from '../controller/inkInUseController.js';

const router = express.Router();

// Dummy middleware for testing without tokens.
// This sets req.user with a valid dummy ObjectId.
router.use((req, res, next) => {
  req.user = { id: "000000000000000000000001" };
  next();
});

// Uncomment the following line and remove the dummy middleware for production:
// router.use(verifyToken);

// POST: Create a new Ink In Use record
router.post('/ink/inuse', addInkInUse);

// GET: Retrieve all Ink In Use records
router.get('/ink/inuse', getAllInkInUse);

export default router;
