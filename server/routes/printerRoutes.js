import express from 'express';
import {
  getAllPrinters,
  getPrinterById,
  addPrinter,
  updatePrinter,
  deletePrinter
} from '../controller/printerController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/printers', verifyToken, getAllPrinters);
router.get('/printers/:id', verifyToken,  getPrinterById);
router.post('/printers', verifyToken, addPrinter);
router.put('/printers/:id', verifyToken, updatePrinter);
router.delete('/printers/:id', verifyToken, deletePrinter);

export default router;
