import { migrate } from 'drizzle-orm/pg-js/migrator';
import { db } from '../db';
import path from 'path';
import logger from '../lib/logger';

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');
    
    await migrate(db, {
      migrationsFolder: path.join(__dirname, '../db/migrations'),
    });
    
    logger.info('Database migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();