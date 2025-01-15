-- Add owner_id to playlists if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'playlists' 
        AND column_name = 'owner_id'
    ) THEN
        -- First, add the owner_id column
        ALTER TABLE playlists 
        ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

        -- Then, copy user_id to owner_id for existing rows
        UPDATE playlists 
        SET owner_id = user_id 
        WHERE owner_id IS NULL;

        -- Make owner_id NOT NULL
        ALTER TABLE playlists 
        ALTER COLUMN owner_id SET NOT NULL;

        -- Set default for new rows
        ALTER TABLE playlists 
        ALTER COLUMN owner_id SET DEFAULT auth.uid();
    END IF;
END $$;
