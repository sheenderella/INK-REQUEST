import express from 'express';
import {
  getAllInkModels,
  getInkModelById,
  addInkModel,
  updateInkModel,
  deleteInkModel
} from '../controller/inkModelController.js';

const router = express.Router();

router.get('/inks/models', getAllInkModels);
router.get('/inks/models/:id', getInkModelById);
router.post('/inks/models', addInkModel);
router.put('/inks/models/:id', updateInkModel);
router.delete('/inks/models/:id', deleteInkModel);

export default router;
