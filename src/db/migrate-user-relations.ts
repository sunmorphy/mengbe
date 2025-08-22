import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from './connection';

async function runUserRelationsMigration() {
  try {
    console.log('Running user relations migration...');
    
    const migrationSQL = readFileSync(join(__dirname, 'add-user-relations.sql'), 'utf8');
    
    const client = await pool.connect();
    try {
      await client.query(migrationSQL);
      console.log('User relations migration completed successfully!');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('User relations migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runUserRelationsMigration();