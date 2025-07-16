-- Create the suggestions table
CREATE TABLE IF NOT EXISTS public.suggestions (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    content TEXT NOT NULL CHECK (
        length(content) > 0
        AND length(content) <= 500
    ),
    anonymous_id VARCHAR(64) NOT NULL,
    votes_up INTEGER DEFAULT 0,
    votes_down INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Create the suggestion_votes table
CREATE TABLE IF NOT EXISTS public.suggestion_votes (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    suggestion_id UUID NOT NULL REFERENCES public.suggestions (id) ON DELETE CASCADE,
    anonymous_id VARCHAR(64) NOT NULL,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        UNIQUE (suggestion_id, anonymous_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON public.suggestions (status);

CREATE INDEX IF NOT EXISTS idx_suggestions_anonymous_id ON public.suggestions (anonymous_id);

CREATE INDEX IF NOT EXISTS idx_suggestion_votes_suggestion_id ON public.suggestion_votes (suggestion_id);

CREATE INDEX IF NOT EXISTS idx_suggestion_votes_anonymous_id ON public.suggestion_votes (anonymous_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.suggestion_votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access on suggestions" ON public.suggestions;

DROP POLICY IF EXISTS "Allow anonymous insert on suggestions" ON public.suggestions;

DROP POLICY IF EXISTS "Allow anonymous read access on suggestion_votes" ON public.suggestion_votes;

DROP POLICY IF EXISTS "Allow anonymous insert on suggestion_votes" ON public.suggestion_votes;

-- Create policies to allow anonymous access
CREATE POLICY "Allow anonymous read access on suggestions" ON public.suggestions FOR
SELECT USING (TRUE);

CREATE POLICY "Allow anonymous insert on suggestions" ON public.suggestions FOR
INSERT
WITH
    CHECK (TRUE);

CREATE POLICY "Allow anonymous read access on suggestion_votes" ON public.suggestion_votes FOR
SELECT USING (TRUE);

CREATE POLICY "Allow anonymous insert on suggestion_votes" ON public.suggestion_votes FOR
INSERT
WITH
    CHECK (TRUE);
