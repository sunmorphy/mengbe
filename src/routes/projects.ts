import { Router } from 'express';
import { query } from '../db/connection';
import { upload } from '../middleware/upload';
import { uploadToImageKit } from '../services/imagekit';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const search = req.query.search as string || '';
    const categoryIds = req.query.categoryIds as string || '';
    
    const offset = (page - 1) * limit;
    
    let whereConditions = ['p.user_id = $1'];
    let queryParams: any[] = [userId];
    let paramIndex = 2;
    
    // Add search condition
    if (search.trim()) {
      whereConditions.push(`(LOWER(p.title) LIKE $${paramIndex} OR LOWER(p.description) LIKE $${paramIndex})`);
      queryParams.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }
    
    // Add category filter condition
    if (categoryIds.trim()) {
      try {
        const categoryIdArray = JSON.parse(categoryIds);
        if (Array.isArray(categoryIdArray) && categoryIdArray.length > 0) {
          const categoryPlaceholders = categoryIdArray.map((_, i) => `$${paramIndex + i}`).join(', ');
          whereConditions.push(`EXISTS (
            SELECT 1 FROM project_categories pc2 
            WHERE pc2.project_id = p.id AND pc2.category_id IN (${categoryPlaceholders})
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
      SELECT COUNT(DISTINCT p.id) as total
      FROM projects p
      LEFT JOIN project_categories pc ON p.id = pc.project_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE ${whereClause}
    `, queryParams);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    // Get paginated results
    const result = await query(`
      SELECT 
        p.id,
        p.batch_image_path,
        p.title,
        p.description,
        p.user_id,
        p.created_at,
        p.updated_at,
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
        ) as project_categories
      FROM projects p
      LEFT JOIN project_categories pc ON p.id = pc.project_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
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
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const search = req.query.search as string || '';
    const categoryIds = req.query.categoryIds as string || '';
    
    const offset = (page - 1) * limit;
    
    let whereConditions = ['p.user_id = $1'];
    let queryParams: any[] = [parseInt(userId)];
    let paramIndex = 2;
    
    // Add search condition
    if (search.trim()) {
      whereConditions.push(`(LOWER(p.title) LIKE $${paramIndex} OR LOWER(p.description) LIKE $${paramIndex})`);
      queryParams.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }
    
    // Add category filter condition
    if (categoryIds.trim()) {
      try {
        const categoryIdArray = JSON.parse(categoryIds);
        if (Array.isArray(categoryIdArray) && categoryIdArray.length > 0) {
          const categoryPlaceholders = categoryIdArray.map((_, i) => `$${paramIndex + i}`).join(', ');
          whereConditions.push(`EXISTS (
            SELECT 1 FROM project_categories pc2 
            WHERE pc2.project_id = p.id AND pc2.category_id IN (${categoryPlaceholders})
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
      SELECT COUNT(DISTINCT p.id) as total
      FROM projects p
      LEFT JOIN project_categories pc ON p.id = pc.project_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE ${whereClause}
    `, queryParams);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    // Get paginated results
    const result = await query(`
      SELECT 
        p.id,
        p.batch_image_path,
        p.title,
        p.description,
        p.user_id,
        p.created_at,
        p.updated_at,
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
        ) as project_categories
      FROM projects p
      LEFT JOIN project_categories pc ON p.id = pc.project_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
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
    res.status(500).json({ error: 'Failed to fetch user projects' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT 
        p.id,
        p.batch_image_path,
        p.title,
        p.description,
        p.user_id,
        p.created_at,
        p.updated_at,
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
        ) as project_categories
      FROM projects p
      LEFT JOIN project_categories pc ON p.id = pc.project_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.id = $1
      GROUP BY p.id
    `, [parseInt(id)]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.post('/', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    const title = req.body?.title || null;
    const description = req.body?.description || null;
    const categoryIds = req.body?.categoryIds || null;
    const files = req.files as Express.Multer.File[];
    const userId = req.user?.userId;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'At least one image file is required' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const username = req.user?.username!;
    const imageUrls = await Promise.all(
      files.map(async (file) => {
        const imageKitResult = await uploadToImageKit(file.buffer, file.originalname, username, 'projects');
        return imageKitResult.url;
      })
    );

    const projectResult = await query(`
      INSERT INTO projects (batch_image_path, title, description, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [imageUrls, title, description || null, userId]);

    const project = projectResult.rows[0];

    if (categoryIds && categoryIds.trim() !== '') {
      try {
        const parsedCategoryIds = JSON.parse(categoryIds);
        if (Array.isArray(parsedCategoryIds) && parsedCategoryIds.length > 0) {
          const values = parsedCategoryIds.map((categoryId: number) => `(${project.id}, ${categoryId})`).join(', ');
          await query(`
            INSERT INTO project_categories (project_id, category_id)
            VALUES ${values}
          `);
        }
      } catch (error) {
        // Ignore JSON parse errors - categories are optional
      }
    }

    const result = await query(`
      SELECT 
        p.id,
        p.batch_image_path,
        p.title,
        p.description,
        p.user_id,
        p.created_at,
        p.updated_at,
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
        ) as project_categories
      FROM projects p
      LEFT JOIN project_categories pc ON p.id = pc.project_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.id = $1
      GROUP BY p.id
    `, [project.id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.put('/:id', authenticateToken, upload.fields([
  { name: 'modifiedImages', maxCount: 10 },
  { name: 'addedImages', maxCount: 10 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const title = req.body?.title || null;
    const description = req.body?.description || null;
    const categoryIds = req.body?.categoryIds || null;
    const userId = req.user?.userId;

    // Get current project to access existing images
    const currentProject = await query(`
      SELECT batch_image_path FROM projects WHERE id = $1 AND user_id = $2
    `, [parseInt(id), userId]);

    if (currentProject.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    let currentImages = [...currentProject.rows[0].batch_image_path];
    let removedIndices: number[] = [];

    // Parse removed image indices
    if (req.body.removedImageIndices) {
      try {
        removedIndices = JSON.parse(req.body.removedImageIndices);
        if (!Array.isArray(removedIndices)) {
          removedIndices = [];
        }
      } catch (error) {
        console.error('Error parsing removedImageIndices:', error);
        removedIndices = [];
      }
    }

    // Handle modified images BEFORE removing images (to maintain original indices)
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const modifiedImages = files?.modifiedImages || [];
    
    if (modifiedImages.length > 0 && req.body.modifiedImageIndices) {
      try {
        const modifiedIndices = req.body.modifiedImageIndices;
        const indices = Array.isArray(modifiedIndices) ? modifiedIndices : [modifiedIndices];
        
        const username = req.user?.username!;
        
        for (let i = 0; i < modifiedImages.length && i < indices.length; i++) {
          const file = modifiedImages[i];
          const originalIndex = parseInt(indices[i]);
          
          // Only modify if the image is not being removed and index is valid
          if (!removedIndices.includes(originalIndex) && 
              originalIndex >= 0 && originalIndex < currentImages.length) {
            // Upload new image
            const imageKitResult = await uploadToImageKit(file.buffer, file.originalname, username, 'projects');
            currentImages[originalIndex] = imageKitResult.url;
          }
        }
      } catch (error) {
        console.error('Error processing modified images:', error);
      }
    }

    // Handle removed images AFTER modifications (remove in reverse order to maintain indexing)
    if (removedIndices.length > 0) {
      removedIndices.sort((a, b) => b - a).forEach(index => {
        if (index >= 0 && index < currentImages.length) {
          currentImages.splice(index, 1);
        }
      });
    }

    // Handle newly added images (append to the end)
    const addedImages = files?.addedImages || [];
    if (addedImages.length > 0) {
      const username = req.user?.username!;
      const addedImageUrls = await Promise.all(
        addedImages.map(async (file) => {
          const imageKitResult = await uploadToImageKit(file.buffer, file.originalname, username, 'projects');
          return imageKitResult.url;
        })
      );
      // Append new images to the end of the current images array
      currentImages.push(...addedImageUrls);
    }

    // Update project with new image array
    const updateQuery = `
      UPDATE projects 
      SET title = $2, description = $3, batch_image_path = $4, updated_at = NOW()
      WHERE id = $1 AND user_id = $5 RETURNING *
    `;
    const updateParams = [parseInt(id), title || null, description || null, currentImages, userId];

    const updateResult = await query(updateQuery, updateParams);
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    if (categoryIds !== undefined) {
      await query(`DELETE FROM project_categories WHERE project_id = $1`, [parseInt(id)]);
      
      if (categoryIds && categoryIds.trim() !== '') {
        try {
          const parsedCategoryIds = JSON.parse(categoryIds);
          if (Array.isArray(parsedCategoryIds) && parsedCategoryIds.length > 0) {
            const values = parsedCategoryIds.map((categoryId: number) => `(${parseInt(id)}, ${categoryId})`).join(', ');
            await query(`
              INSERT INTO project_categories (project_id, category_id)
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
        p.id,
        p.batch_image_path,
        p.title,
        p.description,
        p.user_id,
        p.created_at,
        p.updated_at,
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
        ) as project_categories
      FROM projects p
      LEFT JOIN project_categories pc ON p.id = pc.project_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.id = $1
      GROUP BY p.id
    `, [parseInt(id)]);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const result = await query(`DELETE FROM projects WHERE id = $1 AND user_id = $2`, [parseInt(id), userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;