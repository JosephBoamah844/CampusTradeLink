import { drizzle } from 'drizzle-orm/pg-js';
import { Pool } from 'pg';
import { config } from '../config';
import * as schema from './schema';

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Create Drizzle database instance
export const db = drizzle(pool, { schema });

// Health check function
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};

// Graceful shutdown
export const closeDatabaseConnection = async (): Promise<void> => {
  await pool.end();
};