import express from 'express';

import { verifyToken } from '../middleware/authMiddleware.js'; // Import the verifyToken middleware
import { createUser } from '../controller/usersController.js'; 

const router = express.Router();

// Define routes related to user
router.post('/users', createUser);  


// Protect the /api/users route with the verifyToken middleware
router.post('/users', verifyToken, createUser);  // Create user only if authenticated


export default router;
