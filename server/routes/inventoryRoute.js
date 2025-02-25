import express from 'express';
import {
  getAllInventory,
  addInventory,
  updateInventory,
  deleteInventory
} from '../controller/inventoryController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/inventory', verifyToken, getAllInventory);
router.post('/inventory', verifyToken, addInventory);
router.put('/inventory/:id', verifyToken, updateInventory);
router.delete('/inventory/:id', verifyToken, deleteInventory);

export default router;
