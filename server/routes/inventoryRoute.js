import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  getAllInventory,
  addInventory,
  updateInventory,
  deleteInventory
} from '../controller/inventoryController.js';

const router = express.Router();

router.get('/inventory',  getAllInventory);
router.post('/inventory',  addInventory);
router.put('/inventory/:id', updateInventory);
router.delete('/inventory/:id',  deleteInventory);

export default router;
