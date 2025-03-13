import express from 'express';
import { getInkInUseRecords} from '../controller/inkInUseController.js';

const router = express.Router();

router.get('/inkinuse', getInkInUseRecords);


export default router;
