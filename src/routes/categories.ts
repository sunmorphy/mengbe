import { Router } from 'express';
import { query } from '../db/connection';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all categories (public, no auth required)
router.get('/', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM categories ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get categories by user ID (public, no auth required)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await query(`SELECT * FROM categories WHERE user_id = $1 ORDER BY created_at DESC`, [parseInt(userId)]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user categories' });
  }
});

// Get current user's categories (requires authentication)
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const result = await query(`SELECT * FROM categories WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user?.userId;
    const result = await query(`
      INSERT INTO categories (name, user_id) 
      VALUES ($1, $2) 
      RETURNING *
    `, [name, userId]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user?.userId;
    const result = await query(`
      UPDATE categories 
      SET name = $2, updated_at = NOW() 
      WHERE id = $1 AND user_id = $3 
      RETURNING *
    `, [parseInt(id), name, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found or unauthorized' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const result = await query(`DELETE FROM categories WHERE id = $1 AND user_id = $2`, [parseInt(id), userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Category not found or unauthorized' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;