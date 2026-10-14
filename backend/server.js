import app from './src/app.js';
import { config, validateEnv } from './src/config/env.js';
import { connectDB, disconnectDB } from './src/config/db.js';

// 1. Validate environment configuration
try {
  validateEnv();
} catch (error) {
  console.error(`[Startup Fatal] ${error.message}`);
  process.exit(1);
}

// 2. Connect to MongoDB and start HTTP Server
let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(config.port, () => {
      console.log('----------------------------------------------------');
      console.log(`[Fable Backend] Server listening on port ${config.port}`);
      console.log(`[Fable Backend] Environment: ${config.nodeEnv}`);
      console.log(`[Fable Backend] CORS allowed client: ${config.clientUrl}`);
      console.log(`[Fable Backend] Health check: http://localhost:${config.port}/health`);
      console.log(`[Fable Backend] Auth endpoints: http://localhost:${config.port}/api/v1/auth`);
      console.log('----------------------------------------------------');
    });
  } catch (error) {
    console.error(`[Startup Fatal] Could not connect to database: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// 3. Graceful Shutdown Handling
const shutdown = async (signal) => {
  console.log(`\n[Fable Backend] Received ${signal}. Starting graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log('[Fable Backend] HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
