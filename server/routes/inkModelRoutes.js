import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  getAllInkModels,
  getInkModelById,
  addInkModel,
  updateInkModel,
  deleteInkModel
} from '../controller/inkModelController.js';

const router = express.Router();

router.get('/inks/models', verifyToken, getAllInkModels);
router.get('/inks/models/:id', verifyToken, getInkModelById);
router.post('/inks/models', addInkModel);
router.put('/inks/models/:id', verifyToken, updateInkModel);
router.delete('/inks/models/:id', verifyToken, deleteInkModel);

export default router;
