// routes/userRoute.js

import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controller/userController.js';

const router = express.Router();



router.post('/register', verifyToken, createUser);
router.get('/users', verifyToken, getAllUsers);
router.get('/users/:id',verifyToken,  getUserById);
router.put('/users/:id', verifyToken, updateUser);
router.delete('/users/:id', verifyToken, deleteUser);

export default router;
