-- Create the moderation_reports table
CREATE TABLE IF NOT EXISTS public.moderation_reports (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    content_id UUID NOT NULL,
    content_type VARCHAR(30) NOT NULL,
    reason TEXT,
    reporter_anonymous_id VARCHAR(64) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        UNIQUE (
            content_id,
            reporter_anonymous_id
        )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_moderation_reports_content_id ON public.moderation_reports (content_id);

CREATE INDEX IF NOT EXISTS idx_moderation_reports_reporter ON public.moderation_reports (reporter_anonymous_id);

CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON public.moderation_reports (status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access on moderation_reports" ON public.moderation_reports;

DROP POLICY IF EXISTS "Allow anonymous insert on moderation_reports" ON public.moderation_reports;

-- Create policies to allow anonymous access
CREATE POLICY "Allow anonymous read access on moderation_reports" ON public.moderation_reports FOR
SELECT USING (TRUE);

CREATE POLICY "Allow anonymous insert on moderation_reports" ON public.moderation_reports FOR
INSERT
WITH
    CHECK (TRUE);
