import { Router } from 'express';
import { query } from '../db/connection';
import { upload } from '../middleware/upload';
import { uploadToImageKit } from '../services/imagekit';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all artworks (public, no auth required)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const search = req.query.search as string || '';
    const categoryIds = req.query.categoryIds as string || '';
    const type = req.query.type as string || '';
    
    const offset = (page - 1) * limit;
    
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;
    
    // Add search condition
    if (search.trim()) {
      whereConditions.push(`(LOWER(a.title) LIKE $${paramIndex} OR LOWER(a.description) LIKE $${paramIndex})`);
      queryParams.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }
    
    // Add type filter condition
    if (type.trim() && (type === 'portfolio' || type === 'scratch')) {
      whereConditions.push(`a.type = $${paramIndex}`);
      queryParams.push(type);
      paramIndex++;
    }
    
    // Add category filter condition
    if (categoryIds.trim()) {
      try {
        const categoryIdArray = JSON.parse(categoryIds);
        if (Array.isArray(categoryIdArray) && categoryIdArray.length > 0) {
          const categoryPlaceholders = categoryIdArray.map((_, i) => `$${paramIndex + i}`).join(', ');
          whereConditions.push(`EXISTS (
            SELECT 1 FROM artwork_categories ac2 
            WHERE ac2.artwork_id = a.id AND ac2.category_id IN (${categoryPlaceholders})
          )`);
          queryParams.push(...categoryIdArray);
          paramIndex += categoryIdArray.length;
        }
      } catch (error) {
        // Ignore invalid JSON
      }
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count for pagination
    const countResult = await query(`
      SELECT COUNT(DISTINCT a.id) as total
      FROM artworks a
      LEFT JOIN artwork_categories ac ON a.id = ac.artwork_id
      LEFT JOIN categories c ON ac.category_id = c.id
      ${whereClause}
    `, queryParams);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    // Get paginated results
    const result = await query(`
      SELECT 
        a.id,
        a.image_path,
        a.title,
        a.description,
        a.type,
        a.user_id,
        a.created_at,
        a.updated_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'category', JSON_BUILD_OBJECT(
                'id', c.id,
                'name', c.name,
                'user_id', c.user_id,
                'created_at', c.created_at,
                'updated_at', c.updated_at
              )
            )
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'
        ) as artwork_categories
      FROM artworks a
      LEFT JOIN artwork_categories ac ON a.id = ac.artwork_id
      LEFT JOIN categories c ON ac.category_id = c.id
      ${whereClause}
      GROUP BY a.id
      ORDER BY a.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...queryParams, limit, offset]);
    
    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch artworks' });
  }
});

// Get artworks by user ID (public, no auth required)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const search = req.query.search as string || '';
    const categoryIds = req.query.categoryIds as string || '';
    const type = req.query.type as string || '';
    
    const offset = (page - 1) * limit;
    
    let whereConditions = ['a.user_id = $1'];
    let queryParams: any[] = [parseInt(userId)];
    let paramIndex = 2;
    
    // Add search condition
    if (search.trim()) {
      whereConditions.push(`(LOWER(a.title) LIKE $${paramIndex} OR LOWER(a.description) LIKE $${paramIndex})`);
      queryParams.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }
    
    // Add type filter condition
    if (type.trim() && (type === 'portfolio' || type === 'scratch')) {
      whereConditions.push(`a.type = $${paramIndex}`);
      queryParams.push(type);
      paramIndex++;
    }
    
    // Add category filter condition
    if (categoryIds.trim()) {
      try {
        const categoryIdArray = JSON.parse(categoryIds);
        if (Array.isArray(categoryIdArray) && categoryIdArray.length > 0) {
          const categoryPlaceholders = categoryIdArray.map((_, i) => `$${paramIndex + i}`).join(', ');
          whereConditions.push(`EXISTS (
            SELECT 1 FROM artwork_categories ac2 
            WHERE ac2.artwork_id = a.id AND ac2.category_id IN (${categoryPlaceholders})
          )`);
          queryParams.push(...categoryIdArray);
          paramIndex += categoryIdArray.length;
        }
      } catch (error) {
        // Ignore invalid JSON
      }
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Get total count for pagination
    const countResult = await query(`
      SELECT COUNT(DISTINCT a.id) as total
      FROM artworks a
      LEFT JOIN artwork_categories ac ON a.id = ac.artwork_id
      LEFT JOIN categories c ON ac.category_id = c.id
      WHERE ${whereClause}
    `, queryParams);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    // Get paginated results
    const result = await query(`
      SELECT 
        a.id,
        a.image_path,
        a.title,
        a.description,
        a.type,
        a.user_id,
        a.created_at,
        a.updated_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'category', JSON_BUILD_OBJECT(
                'id', c.id,
                'name', c.name,
                'user_id', c.user_id,
                'created_at', c.created_at,
                'updated_at', c.updated_at
              )
            )
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'
        ) as artwork_categories
      FROM artworks a
      LEFT JOIN artwork_categories ac ON a.id = ac.artwork_id
      LEFT JOIN categories c ON ac.category_id = c.id
      WHERE ${whereClause}
      GROUP BY a.id
      ORDER BY a.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...queryParams, limit, offset]);
    
    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user artworks' });
  }
});

// Get current user's artworks (requires authentication)
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const search = req.query.search as string || '';
    const categoryIds = req.query.categoryIds as string || '';
    const type = req.query.type as string || '';
    
    const offset = (page - 1) * limit;
    
    let whereConditions = ['a.user_id = $1'];
    let queryParams: any[] = [userId];
    let paramIndex = 2;
    
    // Add search condition
    if (search.trim()) {
      whereConditions.push(`(LOWER(a.title) LIKE $${paramIndex} OR LOWER(a.description) LIKE $${paramIndex})`);
      queryParams.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }
    
    // Add type filter condition
    if (type.trim() && (type === 'portfolio' || type === 'scratch')) {
      whereConditions.push(`a.type = $${paramIndex}`);
      queryParams.push(type);
      paramIndex++;
    }
    
    // Add category filter condition
    if (categoryIds.trim()) {
      try {
        const categoryIdArray = JSON.parse(categoryIds);
        if (Array.isArray(categoryIdArray) && categoryIdArray.length > 0) {
          const categoryPlaceholders = categoryIdArray.map((_, i) => `$${paramIndex + i}`).join(', ');
          whereConditions.push(`EXISTS (
            SELECT 1 FROM artwork_categories ac2 
            WHERE ac2.artwork_id = a.id AND ac2.category_id IN (${categoryPlaceholders})
          )`);
          queryParams.push(...categoryIdArray);
          paramIndex += categoryIdArray.length;
        }
      } catch (error) {
        // Ignore invalid JSON
      }
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Get total count for pagination
    const countResult = await query(`
      SELECT COUNT(DISTINCT a.id) as total
      FROM artworks a
      LEFT JOIN artwork_categories ac ON a.id = ac.artwork_id
      LEFT JOIN categories c ON ac.category_id = c.id
      WHERE ${whereClause}
    `, queryParams);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    // Get paginated results
    const result = await query(`
      SELECT 
        a.id,
        a.image_path,
        a.title,
        a.description,
        a.type,
        a.user_id,
        a.created_at,
        a.updated_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'category', JSON_BUILD_OBJECT(
                'id', c.id,
                'name', c.name,
                'user_id', c.user_id,
                'created_at', c.created_at,
                'updated_at', c.updated_at
              )
            )
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'
        ) as artwork_categories
      FROM artworks a
      LEFT JOIN artwork_categories ac ON a.id = ac.artwork_id
      LEFT JOIN categories c ON ac.category_id = c.id
      WHERE ${whereClause}
      GROUP BY a.id
      ORDER BY a.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...queryParams, limit, offset]);
    
    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch artworks' });
  }
});

// Get single artwork (public, no auth required)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT 
        a.id,
        a.image_path,
        a.title,
        a.description,
        a.type,
        a.user_id,
        a.created_at,
        a.updated_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'category', JSON_BUILD_OBJECT(
                'id', c.id,
                'name', c.name,
                'user_id', c.user_id,
                'created_at', c.created_at,
                'updated_at', c.updated_at
              )
            )
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'
        ) as artwork_categories
      FROM artworks a
      LEFT JOIN artwork_categories ac ON a.id = ac.artwork_id
      LEFT JOIN categories c ON ac.category_id = c.id
      WHERE a.id = $1
      GROUP BY a.id
    `, [parseInt(id)]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artwork not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch artwork' });
  }
});

router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    // Extract fields from req.body (populated by multer)
    const title = req.body?.title || null;
    const description = req.body?.description || null;
    const type = req.body?.type || 'portfolio';
    const categoryIds = req.body?.categoryIds || null;
    const file = req.file;
    const userId = req.user?.userId;

    if (!file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Validate type field
    if (type && !['portfolio', 'scratch'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "portfolio" or "scratch"' });
    }

    const username = req.user?.username!;
    const imageKitResult = await uploadToImageKit(file.buffer, file.originalname, username, 'artworks');

    const artworkResult = await query(`
      INSERT INTO artworks (image_path, title, description, type, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [imageKitResult.url, title || null, description || null, type, userId]);

    const artwork = artworkResult.rows[0];

    if (categoryIds && categoryIds.trim() !== '') {
      try {
        const parsedCategoryIds = JSON.parse(categoryIds);
        if (Array.isArray(parsedCategoryIds) && parsedCategoryIds.length > 0) {
          const values = parsedCategoryIds.map((categoryId: number) => `(${artwork.id}, ${categoryId})`).join(', ');
          await query(`
            INSERT INTO artwork_categories (artwork_id, category_id)
            VALUES ${values}
          `);
        }
      } catch (error) {
        // Ignore JSON parse errors - categories are optional
      }
    }

    const result = await query(`
      SELECT 
        a.id,
        a.image_path,
        a.title,
        a.description,
        a.type,
        a.user_id,
        a.created_at,
        a.updated_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'category', JSON_BUILD_OBJECT(
                'id', c.id,
                'name', c.name,
                'user_id', c.user_id,
                'created_at', c.created_at,
                'updated_at', c.updated_at
              )
            )
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'
        ) as artwork_categories
      FROM artworks a
      LEFT JOIN artwork_categories ac ON a.id = ac.artwork_id
      LEFT JOIN categories c ON ac.category_id = c.id
      WHERE a.id = $1
      GROUP BY a.id
    `, [artwork.id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to create artwork',
      message: error instanceof Error ? error.message : 'Unknown error'
     });
  }
});

router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const title = req.body?.title || null;
    const description = req.body?.description || null;
    const type = req.body?.type;
    const categoryIds = req.body?.categoryIds || null;
    const file = req.file;
    const userId = req.user?.userId;

    // Validate type field if provided
    if (type && !['portfolio', 'scratch'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "portfolio" or "scratch"' });
    }

    let updateQuery = `
      UPDATE artworks 
      SET title = $2, description = $3, type = $4, updated_at = NOW()
    `;
    let updateParams = [parseInt(id), title || null, description || null, type];

    if (file) {
      const username = req.user?.username!;
      const imageKitResult = await uploadToImageKit(file.buffer, file.originalname, username, 'artworks');
      updateQuery = `
        UPDATE artworks 
        SET title = $2, description = $3, type = $4, image_path = $5, updated_at = NOW()
      `;
      updateParams = [parseInt(id), title || null, description || null, type, imageKitResult.url];
    }

    updateQuery += ` WHERE id = $1 AND user_id = $${updateParams.length + 1} RETURNING *`;
    updateParams.push(userId);

    const updateResult = await query(updateQuery, updateParams);
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artwork not found or unauthorized' });
    }

    if (categoryIds !== undefined) {
      await query(`DELETE FROM artwork_categories WHERE artwork_id = $1`, [parseInt(id)]);
      
      if (categoryIds && categoryIds.trim() !== '') {
        try {
          const parsedCategoryIds = JSON.parse(categoryIds);
          if (Array.isArray(parsedCategoryIds) && parsedCategoryIds.length > 0) {
            const values = parsedCategoryIds.map((categoryId: number) => `(${parseInt(id)}, ${categoryId})`).join(', ');
            await query(`
              INSERT INTO artwork_categories (artwork_id, category_id)
              VALUES ${values}
            `);
          }
        } catch (error) {
          // Ignore JSON parse errors - categories are optional
        }
      }
    }

    const result = await query(`
      SELECT 
        a.id,
        a.image_path,
        a.title,
        a.description,
        a.type,
        a.user_id,
        a.created_at,
        a.updated_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'category', JSON_BUILD_OBJECT(
                'id', c.id,
                'name', c.name,
                'user_id', c.user_id,
                'created_at', c.created_at,
                'updated_at', c.updated_at
              )
            )
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'
        ) as artwork_categories
      FROM artworks a
      LEFT JOIN artwork_categories ac ON a.id = ac.artwork_id
      LEFT JOIN categories c ON ac.category_id = c.id
      WHERE a.id = $1
      GROUP BY a.id
    `, [parseInt(id)]);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update artwork' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const result = await query(`DELETE FROM artworks WHERE id = $1 AND user_id = $2`, [parseInt(id), userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Artwork not found or unauthorized' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete artwork' });
  }
});

export default router;