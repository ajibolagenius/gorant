DROP POLICY IF EXISTS "Allow anonymous update on comments" ON public.comments;

CREATE POLICY "Allow anonymous update on comments" ON public.comments FOR
UPDATE USING (TRUE);
