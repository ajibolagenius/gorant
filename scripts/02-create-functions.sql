-- Function to increment likes count
CREATE OR REPLACE FUNCTION public.increment_likes(rant_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.rants 
    SET likes_count = likes_count + 1 
    WHERE id = rant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment comments count
CREATE OR REPLACE FUNCTION public.increment_comments(rant_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.rants 
    SET comments_count = comments_count + 1 
    WHERE id = rant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get rants with full-text search
CREATE OR REPLACE FUNCTION public.search_rants(search_term TEXT)
RETURNS TABLE(
    id UUID,
    content TEXT,
    mood VARCHAR(20),
    likes_count INTEGER,
    comments_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.content, r.mood, r.likes_count, r.comments_count, r.created_at
    FROM public.rants r
    WHERE r.content ILIKE '%' || search_term || '%'
    ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions to anonymous users
GRANT EXECUTE ON FUNCTION public.increment_likes(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_comments(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.search_rants(TEXT) TO anon;
