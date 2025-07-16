-- Create the gamification table
CREATE TABLE IF NOT EXISTS public.gamification (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    anonymous_id VARCHAR(64) NOT NULL,
    points INTEGER DEFAULT 0,
    badges JSONB DEFAULT '[]',
    achievements JSONB DEFAULT '[]',
    last_updated TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        UNIQUE (anonymous_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gamification_anonymous_id ON public.gamification (anonymous_id);

CREATE INDEX IF NOT EXISTS idx_gamification_points ON public.gamification (points DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.gamification ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access on gamification" ON public.gamification;

DROP POLICY IF EXISTS "Allow anonymous insert on gamification" ON public.gamification;

DROP POLICY IF EXISTS "Allow anonymous update on gamification" ON public.gamification;

-- Create policies to allow anonymous access
CREATE POLICY "Allow anonymous read access on gamification" ON public.gamification FOR
SELECT USING (TRUE);

CREATE POLICY "Allow anonymous insert on gamification" ON public.gamification FOR
INSERT
WITH
    CHECK (TRUE);

CREATE POLICY "Allow anonymous update on gamification" ON public.gamification FOR
UPDATE USING (TRUE);
