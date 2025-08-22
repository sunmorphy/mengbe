import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from './connection';

async function runProfileImageMigration() {
  try {
    console.log('Running profile image migration...');
    
    const migrationSQL = readFileSync(join(__dirname, 'migrate-profile-image.sql'), 'utf8');
    
    const client = await pool.connect();
    try {
      await client.query(migrationSQL);
      console.log('Profile image migration completed successfully!');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Profile image migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runProfileImageMigration();