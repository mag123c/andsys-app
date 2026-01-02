-- Add plot field to chapters table
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS plot text;

-- Add comment
COMMENT ON COLUMN chapters.plot IS 'Chapter plot memo (plain text)';
