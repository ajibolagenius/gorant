-- Create the leaderboard table
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    category VARCHAR(30) NOT NULL, -- e.g., points, posts, likes_given, achievements
    anonymous_id VARCHAR(64) NOT NULL,
    RANK INTEGER,
    score INTEGER, -- for points leaderboard
    value INTEGER, -- for posts, likes_given, achievements
    level INTEGER, -- for points leaderboard
    badge VARCHAR(10), -- emoji or badge
    last_updated TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        UNIQUE (category, anonymous_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_category ON public.leaderboard (category);

CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.leaderboard (score DESC);

CREATE INDEX IF NOT EXISTS idx_leaderboard_value ON public.leaderboard (value DESC);

CREATE INDEX IF NOT EXISTS idx_leaderboard_anonymous_id ON public.leaderboard (anonymous_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access on leaderboard" ON public.leaderboard;

DROP POLICY IF EXISTS "Allow anonymous insert on leaderboard" ON public.leaderboard;

-- Create policies to allow anonymous access
CREATE POLICY "Allow anonymous read access on leaderboard" ON public.leaderboard FOR
SELECT USING (TRUE);

CREATE POLICY "Allow anonymous insert on leaderboard" ON public.leaderboard FOR
INSERT
WITH
    CHECK (TRUE);
