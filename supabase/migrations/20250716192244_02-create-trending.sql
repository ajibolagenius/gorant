-- Create the trending table
CREATE TABLE IF NOT EXISTS public.trending (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    rant_id UUID NOT NULL REFERENCES public.rants (id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    calculated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        anonymous_id VARCHAR(64), -- optional, if you want to track who triggered trending
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trending_rant_id ON public.trending (rant_id);

CREATE INDEX IF NOT EXISTS idx_trending_score ON public.trending (score DESC);

CREATE INDEX IF NOT EXISTS idx_trending_calculated_at ON public.trending (calculated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.trending ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access on trending" ON public.trending;

DROP POLICY IF EXISTS "Allow anonymous insert on trending" ON public.trending;

-- Create policies to allow anonymous access
CREATE POLICY "Allow anonymous read access on trending" ON public.trending FOR
SELECT USING (TRUE);

CREATE POLICY "Allow anonymous insert on trending" ON public.trending FOR
INSERT
WITH
    CHECK (TRUE);
