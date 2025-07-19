-- Add a tags column to the rants table for storing hashtags as an array of text
ALTER TABLE rants ADD COLUMN tags text[];
