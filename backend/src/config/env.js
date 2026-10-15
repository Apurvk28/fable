import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  // Dedicated CSRF Secret with graceful fallback to jwtSecret for cryptographic separation
  csrfSecret: process.env.CSRF_SECRET || process.env.JWT_SECRET,
  isCrossSite: process.env.COOKIE_CROSS_SITE === 'true',
  groqApiKey: process.env.GROQ_API_KEY,
};

export const validateEnv = () => {
  if (isNaN(config.port) || config.port <= 0 || config.port > 65535) {
    throw new Error(`[Config Error] Invalid PORT specified: "${process.env.PORT}"`);
  }

  if (!config.mongodbUri) {
    throw new Error(
      '[Config Error] Missing required environment variable MONGODB_URI. Please set it in backend/.env'
    );
  }

  if (!config.jwtSecret || config.jwtSecret.length < 16) {
    throw new Error(
      '[Config Error] Missing or insecure JWT_SECRET. Must be at least 16 characters in backend/.env'
    );
  }
};
