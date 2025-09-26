import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000'),
  HOST: process.env.HOST || '0.0.0.0',

  // Database
  DATABASE_URL: process.env.DATABASE_URL!,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432'),
  DB_NAME: process.env.DB_NAME || 'campus_trade_link',
  DB_USER: process.env.DB_USER!,
  DB_PASSWORD: process.env.DB_PASSWORD!,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,

  // Email
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER!,
  SMTP_PASS: process.env.SMTP_PASS!,
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@campustradelink.com',
  FROM_NAME: process.env.FROM_NAME || 'Campus Trade Link',

  // Redis
  REDIS_URL: process.env.REDIS_URL,

  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/jpg,image/png,image/gif,image/webp').split(','),

  // Application
  APP_NAME: process.env.APP_NAME || 'Campus Trade Link',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  API_URL: process.env.API_URL || 'http://localhost:4000',
  WEB_URL: process.env.WEB_URL || 'http://localhost:3000',

  // Testing
  MAX_USERS: parseInt(process.env.MAX_USERS || '10'),
  STUDENT_EMAIL_DOMAIN: process.env.STUDENT_EMAIL_DOMAIN || '@st.ug.edu.gh',

  // CORS
  CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:19006').split(','),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),

  // Socket.io
  SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
} as const;

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SMTP_USER',
  'SMTP_PASS',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}