import express from 'express';
import {
  getAllInkModels,
  getInkModelById,
  addInkModel,
  updateInkModel,
  deleteInkModel
} from '../controller/inkModelController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/inks/models', verifyToken, getAllInkModels);
router.get('/inks/models/:id', verifyToken, getInkModelById);
router.post('/inks/models', verifyToken, addInkModel);
router.put('/inks/models/:id', verifyToken, updateInkModel);
router.delete('/inks/models/:id',verifyToken, deleteInkModel);

export default router;
