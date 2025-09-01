-- Migration: ensure candidates.photo can store binary image data
-- Run this against the 'votingdb' database.

ALTER TABLE candidates 
  MODIFY COLUMN photo LONGBLOB NULL;

-- Optional: if column didn't exist or was misnamed uncomment below examples
-- ALTER TABLE candidates ADD COLUMN photo LONGBLOB NULL AFTER name;

-- Verify
-- SHOW COLUMNS FROM candidates LIKE 'photo';
