import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import detect from 'detect-port';
import kill from 'kill-port'; // new import
import { createDefaultAdmin } from './controller/adminSetup.js';

import userRoutes from './routes/userRoute.js';
import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoute.js';
import inventoryRoutes from './routes/inventoryRoute.js';
import printerRoutes from './routes/printerRoutes.js';
import inkRoutes from './routes/inkModelRoutes.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', userRoutes, authRoutes, printerRoutes, inkRoutes, inventoryRoutes, requestRoutes);

mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB Connected');
    await createDefaultAdmin();
  })
  .catch((err) => console.log('MongoDB connection error:', err));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, 'client/build')));

(async () => {
  const defaultPort = Number(process.env.PORT) || 8000;
  
  // Kill any process running on the desired port
  try {
    await kill(defaultPort);
    console.log(`Killed any process running on port ${defaultPort}`);
  } catch (err) {
    // If nothing is using the port, kill-port may throw an error; this can be safely ignored
    console.error(`Error while trying to kill process on port ${defaultPort}:`, err);
  }
  
  // Ensure that the port is available
  const port = await detect(defaultPort);
  if (port !== defaultPort) {
    console.log(`Port ${defaultPort} in use. Using port ${port} instead.`);
  }
  
  const server = app.listen(port, '0.0.0.0', () => console.log(`Server running on port ${port}`));

  // Optional: Log registered routes for debugging
  app._router.stack.forEach(mw => mw.route && console.log(`Registered route: ${mw.route.path}`));

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') console.error(`Port ${port} is already in use.`);
    else console.error('Server error:', error);
    process.exit(1);
  });

  const shutdown = () => {
    console.log('\nGracefully shutting down...');
    server.close(() => {
      console.log('HTTP server closed.');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    });
    setTimeout(() => {
      console.error('Forcing shutdown.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})();
