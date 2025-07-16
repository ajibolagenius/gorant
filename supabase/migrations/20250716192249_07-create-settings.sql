-- Create the settings table
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    anonymous_id VARCHAR(64) NOT NULL,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        UNIQUE (anonymous_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_settings_anonymous_id ON public.settings (anonymous_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access on settings" ON public.settings;

DROP POLICY IF EXISTS "Allow anonymous insert on settings" ON public.settings;

DROP POLICY IF EXISTS "Allow anonymous update on settings" ON public.settings;

-- Create policies to allow anonymous access
CREATE POLICY "Allow anonymous read access on settings" ON public.settings FOR
SELECT USING (TRUE);

CREATE POLICY "Allow anonymous insert on settings" ON public.settings FOR
INSERT
WITH
    CHECK (TRUE);

CREATE POLICY "Allow anonymous update on settings" ON public.settings FOR
UPDATE USING (TRUE);
