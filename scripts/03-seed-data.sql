-- Insert sample rants for testing
INSERT INTO public.rants (content, mood, likes_count, comments_count) VALUES
('Just had the worst day at work. Everything that could go wrong did go wrong. Need to vent somewhere!', 'angry', 5, 2),
('Finally got that promotion I''ve been working towards for months! So grateful and excited for what''s next.', 'excited', 12, 4),
('Feeling really anxious about the presentation tomorrow. Public speaking has always been my weakness.', 'anxious', 3, 1),
('My dog passed away today. 15 years of unconditional love. I''m going to miss him so much.', 'sad', 8, 6),
('Sometimes I wonder what the point of it all is. Life feels so confusing and overwhelming lately.', 'confused', 4, 3),
('Met someone amazing today. There''s something special about genuine human connection.', 'love', 15, 5),
('Been working 12-hour days for weeks. I''m exhausted but can''t seem to catch a break.', 'tired', 7, 2),
('Grateful for my family, friends, and health. Sometimes we forget to appreciate the simple things.', 'happy', 20, 8);

-- Insert sample comments
INSERT INTO public.comments (rant_id, content) VALUES
((SELECT id FROM public.rants WHERE content LIKE '%worst day at work%' LIMIT 1), 'I feel you! Some days are just terrible.'),
((SELECT id FROM public.rants WHERE content LIKE '%worst day at work%' LIMIT 1), 'Tomorrow will be better, hang in there!'),
((SELECT id FROM public.rants WHERE content LIKE '%promotion%' LIMIT 1), 'Congratulations! You deserve it!'),
((SELECT id FROM public.rants WHERE content LIKE '%promotion%' LIMIT 1), 'That''s amazing news! Celebrate tonight!'),
((SELECT id FROM public.rants WHERE content LIKE '%dog passed away%' LIMIT 1), 'So sorry for your loss. Pets are family.'),
((SELECT id FROM public.rants WHERE content LIKE '%dog passed away%' LIMIT 1), 'Sending you love during this difficult time.'),
((SELECT id FROM public.rants WHERE content LIKE '%grateful for my family%' LIMIT 1), 'Beautiful perspective on life!'),
((SELECT id FROM public.rants WHERE content LIKE '%grateful for my family%' LIMIT 1), 'Gratitude is so important. Thanks for the reminder.');
