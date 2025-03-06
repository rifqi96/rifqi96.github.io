-- Add order column to projects table
ALTER TABLE projects ADD COLUMN "order" INTEGER DEFAULT 0;

-- Set default order to the current timestamp
UPDATE projects SET "order" = 0;

-- Ensure the order column is not null
ALTER TABLE projects ALTER COLUMN "order" SET NOT NULL;
