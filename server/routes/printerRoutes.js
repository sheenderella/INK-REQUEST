import express from 'express';
import {
  getAllPrinters,
  getPrinterById,
  addPrinter,
  updatePrinter,
  deletePrinter
} from '../controller/printerController.js';

const router = express.Router();

router.get('/printers', getAllPrinters);
router.get('/printers/:id', getPrinterById);
router.post('/printers', addPrinter);
router.put('/printers/:id', updatePrinter);
router.delete('/printers/:id', deletePrinter);

export default router;
