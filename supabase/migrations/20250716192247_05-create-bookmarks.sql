-- Create the bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    anonymous_id VARCHAR(64) NOT NULL,
    rant_id UUID NOT NULL REFERENCES public.rants (id) ON DELETE CASCADE,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        UNIQUE (anonymous_id, rant_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_anonymous_id ON public.bookmarks (anonymous_id);

CREATE INDEX IF NOT EXISTS idx_bookmarks_rant_id ON public.bookmarks (rant_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access on bookmarks" ON public.bookmarks;

DROP POLICY IF EXISTS "Allow anonymous insert on bookmarks" ON public.bookmarks;

-- Create policies to allow anonymous access
CREATE POLICY "Allow anonymous read access on bookmarks" ON public.bookmarks FOR
SELECT USING (TRUE);

CREATE POLICY "Allow anonymous insert on bookmarks" ON public.bookmarks FOR
INSERT
WITH
    CHECK (TRUE);
