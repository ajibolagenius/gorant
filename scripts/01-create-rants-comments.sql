-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the rants table
CREATE TABLE IF NOT EXISTS public.rants (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    content TEXT NOT NULL CHECK (
        length(content) > 0
        AND length(content) <= 500
    ),
    mood VARCHAR(20) NOT NULL CHECK (
        mood IN (
            'sad',
            'crying',
            'happy',
            'neutral',
            'angry',
            'heartbroken',
            'love',
            'anxious',
            'confused',
            'tired',
            'excited',
            'confident'
        )
    ),
    likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
    comments_count INTEGER DEFAULT 0 CHECK (comments_count >= 0),
    anonymous_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Create the comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    rant_id UUID NOT NULL REFERENCES public.rants (id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (
        length(content) > 0
        AND length(content) <= 300
    ),
    anonymous_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rants_created_at ON public.rants (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rants_likes_count ON public.rants (likes_count DESC);

CREATE INDEX IF NOT EXISTS idx_rants_mood ON public.rants (mood);

CREATE INDEX IF NOT EXISTS idx_rants_anonymous_id ON public.rants (anonymous_id);

CREATE INDEX IF NOT EXISTS idx_comments_rant_id ON public.comments (rant_id);

CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments (created_at);

CREATE INDEX IF NOT EXISTS idx_comments_anonymous_id ON public.comments (anonymous_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.rants ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access on rants" ON public.rants;

DROP POLICY IF EXISTS "Allow anonymous insert on rants" ON public.rants;

DROP POLICY IF EXISTS "Allow anonymous update on rants" ON public.rants;

DROP POLICY IF EXISTS "Allow anonymous read access on comments" ON public.comments;

DROP POLICY IF EXISTS "Allow anonymous insert on comments" ON public.comments;

-- Create policies to allow anonymous access
CREATE POLICY "Allow anonymous read access on rants" ON public.rants FOR
SELECT USING (TRUE);

CREATE POLICY "Allow anonymous insert on rants" ON public.rants FOR
INSERT
WITH
    CHECK (TRUE);

CREATE POLICY "Allow anonymous update on rants" ON public.rants FOR
UPDATE USING (TRUE);

CREATE POLICY "Allow anonymous read access on comments" ON public.comments FOR
SELECT USING (TRUE);

CREATE POLICY "Allow anonymous insert on comments" ON public.comments FOR
INSERT
WITH
    CHECK (TRUE);
