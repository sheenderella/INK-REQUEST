// routes/auth.js
import express from 'express';
import { loginUser } from '../controller/authController.js';
import { logoutUser } from '../controller/logoutUser.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/logout', verifyToken, logoutUser);

export default router;
