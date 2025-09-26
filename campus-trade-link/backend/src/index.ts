import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config';
import { checkDatabaseConnection } from './db';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { rateLimit } from './middleware/rateLimiting';
import { handleSocketConnection } from './socket/events';
import logger from './lib/logger';

async function startServer() {
  // Check database connection
  const dbConnected = await checkDatabaseConnection();
  if (!dbConnected) {
    logger.error('Failed to connect to database');
    process.exit(1);
  }

  // Create Express app
  const app = express();
  const server = createServer(app);

  // Setup Socket.io
  const io = new Server(server, {
    cors: {
      origin: config.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Middleware
  app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Global rate limiting
  app.use(rateLimit());

  // Request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path} - ${req.ip}`);
    next();
  });

  // API routes
  app.use('/api', routes);

  // Socket.io connection handling
  handleSocketConnection(io);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  // Start server
  const PORT = config.PORT;
  const HOST = config.HOST;

  server.listen(PORT, HOST, () => {
    logger.info(`🚀 Campus Trade Link API running on ${HOST}:${PORT}`);
    logger.info(`📱 Environment: ${config.NODE_ENV}`);
    logger.info(`🔌 Socket.io enabled`);
    logger.info(`📊 Database connected`);
    
    if (config.NODE_ENV === 'development') {
      logger.info(`📖 API Documentation: http://${HOST}:${PORT}/api`);
      logger.info(`❤️  Health Check: http://${HOST}:${PORT}/api/health`);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();