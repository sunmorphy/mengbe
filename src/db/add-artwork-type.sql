-- Add 'type' column to artworks table
-- Values can be either 'portfolio' or 'scratch'

ALTER TABLE artworks 
ADD COLUMN type VARCHAR(20) DEFAULT 'portfolio' CHECK (type IN ('portfolio', 'scratch'));

-- Update existing records to have default type 'portfolio'
UPDATE artworks SET type = 'portfolio' WHERE type IS NULL;