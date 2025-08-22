import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from './connection';

async function runMigration() {
  try {
    console.log('Running database migration...');
    
    const schemaSQL = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
    
    const client = await pool.connect();
    try {
      await client.query(schemaSQL);
      console.log('Migration completed successfully!');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();