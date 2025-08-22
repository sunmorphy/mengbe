-- Add profile_image_path column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_path TEXT;