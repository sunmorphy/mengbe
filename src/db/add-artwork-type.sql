-- Add 'type' column to artworks table if it doesn't exist
-- Values can be either 'portfolio' or 'scratch'

DO $$ 
BEGIN
    -- Check if column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artworks' AND column_name = 'type'
    ) THEN
        ALTER TABLE artworks 
        ADD COLUMN type VARCHAR(20) DEFAULT 'portfolio' CHECK (type IN ('portfolio', 'scratch'));
        
        -- Update existing records to have default type 'portfolio'
        UPDATE artworks SET type = 'portfolio' WHERE type IS NULL;
        
        RAISE NOTICE 'Added type column to artworks table';
    ELSE
        RAISE NOTICE 'Type column already exists in artworks table';
    END IF;
END $$;