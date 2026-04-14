-- Add archived_at column to projects table for soft-delete / archiving
ALTER TABLE projects ADD COLUMN archived_at timestamptz DEFAULT NULL;

-- Index for filtering out archived projects efficiently
CREATE INDEX idx_projects_archived_at ON projects (archived_at) WHERE archived_at IS NULL;
