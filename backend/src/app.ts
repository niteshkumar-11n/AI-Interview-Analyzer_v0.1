/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */
import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.ts';
import userRoutes from './routes/userRoutes.ts';
import dashboardRoutes from './routes/dashboardRoutes.ts';
import { errorMiddleware } from './middleware/errorMiddleware.ts';
import jobRoutes from './routes/jobRoutes.ts';
import codingRoutes from './routes/codingRoutes.ts';

export async function createApp() {
  const app = express();

  // CORS middleware for cross-origin frontend communication
  app.use((req, res, next) => {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Body parsing
  app.use(express.json());

  // Logging middleware
  app.use('/api', (req, _res, next) => {
    console.log(`[RESTful API ${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
    next();
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    const dbStatus = mongoose.connection.readyState === 1
      ? 'connected (MongoDB Atlas)'
      : mongoose.connection.readyState === 2
      ? 'connecting'
      : 'in-memory / disconnected';

    res.json({
      status: 'ok',
      service: 'SkillNexus AI Server',
      database: dbStatus,
      databaseReadyState: mongoose.connection.readyState,
      timestamp: new Date().toISOString()
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/profile', userRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/job', jobRoutes);
  app.use('/api/coding', codingRoutes);

  // In production, serve the built frontend assets
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Error handling
  app.use(errorMiddleware);

  return app;
}
