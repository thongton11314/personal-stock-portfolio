import express from 'express';
import cors from 'cors';
import path from 'path';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import adminHoldingsRoutes from './routes/adminHoldings';
import adminMarketRoutes from './routes/adminMarket';
import adminSettingsRoutes from './routes/adminSettings';
import adminDashboardRoutes from './routes/adminDashboard';
import adminPerformanceRoutes from './routes/adminPerformance';
import adminPublishRoutes from './routes/adminPublish';
import publicPortfolioRoutes from './routes/publicPortfolio';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth routes (no auth middleware)
  app.use('/api/auth', authRoutes);

  // Admin routes (auth required)
  app.use('/api/admin/holdings', authMiddleware, adminHoldingsRoutes);
  app.use('/api/admin/market', authMiddleware, adminMarketRoutes);
  app.use('/api/admin/settings', authMiddleware, adminSettingsRoutes);
  app.use('/api/admin/dashboard', authMiddleware, adminDashboardRoutes);
  app.use('/api/admin/performance', authMiddleware, adminPerformanceRoutes);
  app.use('/api/admin', authMiddleware, adminPublishRoutes);

  // Public routes (no auth)
  app.use('/api/public', publicPortfolioRoutes);

  // Serve static frontend in production
  if (process.env.NODE_ENV === 'production') {
    const clientDist = path.join(__dirname, '../../client/dist');
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  // Error handler
  app.use(errorHandler);

  return app;
}
