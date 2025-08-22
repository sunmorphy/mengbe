import { query } from './connection';
import fs from 'fs';
import path from 'path';

async function migrateArtworkType() {
  try {
    console.log('Starting artwork type migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-artwork-type.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the migration
    await query(sql);
    
    console.log('Artwork type migration completed successfully!');
  } catch (error) {
    console.error('Error during artwork type migration:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateArtworkType()
    .then(() => {
      console.log('Migration finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateArtworkType };