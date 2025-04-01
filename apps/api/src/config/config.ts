import dotenv from 'dotenv';

// Load env vars
dotenv.config();

interface Config {
  env: string;
  port: number;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  logLevel: string;
}

// Environment variables with defaults
const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
  isTest: process.env.NODE_ENV === 'test',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'express_api',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  logLevel: process.env.LOG_LEVEL || 'info',
};

export default config; 