-- Create the challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    emoji VARCHAR(10),
    type VARCHAR(30),
    participants JSONB DEFAULT '[]', -- array of anonymous_id
    participants_count INTEGER DEFAULT 0,
    progress INTEGER,
    days_left INTEGER,
    reward TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    completed_date TIMESTAMP
    WITH
        TIME ZONE,
        winner BOOLEAN,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_challenges_is_active ON public.challenges (is_active);

CREATE INDEX IF NOT EXISTS idx_challenges_title ON public.challenges (title);

CREATE INDEX IF NOT EXISTS idx_challenges_participants_count ON public.challenges (participants_count DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access on challenges" ON public.challenges;

DROP POLICY IF EXISTS "Allow anonymous insert on challenges" ON public.challenges;

-- Create policies to allow anonymous access
CREATE POLICY "Allow anonymous read access on challenges" ON public.challenges FOR
SELECT USING (TRUE);

CREATE POLICY "Allow anonymous insert on challenges" ON public.challenges FOR
INSERT
WITH
    CHECK (TRUE);
