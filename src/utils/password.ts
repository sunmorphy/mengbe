import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw new Error('Failed to hash password');
  }
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('Failed to compare password');
  }
};