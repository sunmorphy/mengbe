import { query } from '../src/db/connection';
import { hashPassword } from '../src/utils/password';

async function createUser(username: string, email: string, password: string, summary?: string, socials?: string[]) {
  try {
    // Check if user already exists
    const existingUser = await query(
      `SELECT id FROM users WHERE username = $1 OR email = $2`,
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      console.error('Username or email already exists');
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(`
      INSERT INTO users (username, email, password_hash, summary, socials)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, summary, socials, created_at, updated_at
    `, [username, email, passwordHash, summary || null, socials || null]);

    console.log('User created successfully:', result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

// Usage example
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log('Usage: ts-node scripts/create-user.ts <username> <email> <password> [summary] [socials...]');
    process.exit(1);
  }
  
  const [username, email, password, summary, ...socials] = args;
  createUser(username, email, password, summary, socials.length > 0 ? socials : undefined);
}