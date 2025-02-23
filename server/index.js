import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createDefaultAdmin } from './controller/adminSetup.js';

import userRoutes from './routes/userRoute.js';
import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoute.js';
import inventoryRoutes from './routes/inventoryRoute.js';
import inkInUseRoutes from './routes/inkInUseRoutes.js';

import printerRoutes from './routes/printerRoutes.js';
import inkRoutes from './routes/inkModelRoutes.js';


dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Use API routes
app.use('/api', userRoutes);
app.use('/api', authRoutes);

app.use('/api', requestRoutes); 
app.use('/api', inventoryRoutes);
app.use('/api', inkInUseRoutes); 

app.use('/api', printerRoutes); 
app.use('/api', inkRoutes); 

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB Connected');
    // Create default admin if none exists
    await createDefaultAdmin();
  })
  .catch((err) => console.log('MongoDB connection error:', err));

// Determine __dirname in an ES module environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React app's build directory
app.use(express.static(path.join(__dirname, 'client/build')));

// Catch-all route to serve React's index.html for any route not matching API endpoints
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Listen on all network interfaces
const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
