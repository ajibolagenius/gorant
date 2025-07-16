-- Create the notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    anonymous_id VARCHAR(64) NOT NULL,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(100),
    message TEXT,
    READ BOOLEAN DEFAULT FALSE,
    TIMESTAMP TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        data JSONB,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_anonymous_id ON public.notifications (anonymous_id);

CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications (READ);

CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON public.notifications (TIMESTAMP DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access on notifications" ON public.notifications;

DROP POLICY IF EXISTS "Allow anonymous insert on notifications" ON public.notifications;

-- Create policies to allow anonymous access
CREATE POLICY "Allow anonymous read access on notifications" ON public.notifications FOR
SELECT USING (TRUE);

CREATE POLICY "Allow anonymous insert on notifications" ON public.notifications FOR
INSERT
WITH
    CHECK (TRUE);
