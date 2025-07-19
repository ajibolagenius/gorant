-- Add a likes_count column to the comments table for comment likes
ALTER TABLE comments ADD COLUMN likes_count integer DEFAULT 0;
