import express from 'express';
import { getInkInUseRecords} from '../controller/inkInUseController.js';

const router = express.Router();

// Route to get InkInUse records (optionally filtered by inkId)
router.get('/inkinuse', getInkInUseRecords);


export default router;
