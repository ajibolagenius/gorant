-- Mock Data Seeding Script for Rant Platform
-- This script populates all tables with realistic sample data

-- First, let's create some anonymous IDs we'll use consistently
-- In a real app, these would be generated client-side

-- Clear existing data (optional - uncomment if you want to start fresh)
-- TRUNCATE TABLE suggestion_votes, suggestions, moderation_reports, gamification,
--          analytics_events, analytics_sessions, settings, notifications,
--          bookmarks, leaderboard, challenges, trending, comments, rants CASCADE;

-- 1. RANTS TABLE
-- Insert sample rants with various moods and content
INSERT INTO
    rants (
        content,
        mood,
        likes_count,
        comments_count,
        anonymous_id,
        created_at
    )
VALUES (
        'Just had the worst day at work. My boss completely ignored my suggestions in the meeting and then took credit for my idea later. So frustrated!',
        'angry',
        23,
        5,
        'anon_user_001',
        NOW() - INTERVAL '2 hours'
    ),
    (
        'Feeling so grateful today! Got a surprise call from an old friend and we talked for hours. Sometimes the little things make the biggest difference.',
        'happy',
        45,
        8,
        'anon_user_002',
        NOW() - INTERVAL '4 hours'
    ),
    (
        'I don''t know what to do anymore. Everything feels overwhelming and I can''t seem to catch a break. Just need someone to listen.',
        'sad',
        67,
        12,
        'anon_user_003',
        NOW() - INTERVAL '6 hours'
    ),
    (
        'Why do people have to be so complicated? Tried to help a friend and they got mad at me for it. I''m so confused about what I did wrong.',
        'confused',
        34,
        7,
        'anon_user_004',
        NOW() - INTERVAL '8 hours'
    ),
    (
        'Can''t sleep again. My mind won''t stop racing with all the things I need to do tomorrow. This anxiety is killing me.',
        'anxious',
        89,
        15,
        'anon_user_005',
        NOW() - INTERVAL '10 hours'
    ),
    (
        'FINALLY got that promotion I''ve been working towards for months! All those late nights and extra projects paid off. I''m over the moon!',
        'excited',
        156,
        23,
        'anon_user_006',
        NOW() - INTERVAL '12 hours'
    ),
    (
        'Heartbroken doesn''t even begin to describe how I feel. Three years together and they just walked away like it meant nothing.',
        'heartbroken',
        234,
        45,
        'anon_user_007',
        NOW() - INTERVAL '1 day'
    ),
    (
        'You know what? I''m done apologizing for who I am. I''m confident in my abilities and I''m not going to let anyone make me feel small anymore.',
        'confident',
        78,
        11,
        'anon_user_008',
        NOW() - INTERVAL '1 day 2 hours'
    ),
    (
        'Exhausted is an understatement. Working two jobs while going to school is taking its toll. I just want to sleep for a week.',
        'tired',
        92,
        18,
        'anon_user_009',
        NOW() - INTERVAL '1 day 4 hours'
    ),
    (
        'Found out my partner has been planning a surprise party for my birthday. I''m not supposed to know but I accidentally saw the messages. I love them so much!',
        'love',
        145,
        28,
        'anon_user_010',
        NOW() - INTERVAL '1 day 6 hours'
    ),
    (
        'Traffic was horrible, coffee machine broke, and I forgot my lunch. Just one of those days where everything goes wrong.',
        'neutral',
        45,
        6,
        'anon_user_011',
        NOW() - INTERVAL '1 day 8 hours'
    ),
    (
        'Crying happy tears right now. My little sister just graduated valedictorian and I couldn''t be more proud of her.',
        'crying',
        189,
        34,
        'anon_user_012',
        NOW() - INTERVAL '1 day 10 hours'
    ),
    (
        'Why does adulting have to be so hard? Bills, responsibilities, and everyone expecting you to have it all figured out. I''m barely keeping my head above water.',
        'anxious',
        167,
        29,
        'anon_user_013',
        NOW() - INTERVAL '2 days'
    ),
    (
        'Had an amazing date last night. We talked until 3 AM and it felt like we''d known each other forever. Butterflies everywhere!',
        'love',
        98,
        16,
        'anon_user_014',
        NOW() - INTERVAL '2 days 2 hours'
    ),
    (
        'My dog passed away today. 12 years of unconditional love and now there''s just this huge empty space in my heart.',
        'heartbroken',
        456,
        78,
        'anon_user_015',
        NOW() - INTERVAL '2 days 4 hours'
    );

-- 2. COMMENTS TABLE
-- Insert comments for the rants above
INSERT INTO
    comments (
        rant_id,
        content,
        anonymous_id,
        created_at
    )
VALUES
    -- Comments for first rant (angry about work)
    (
        (
            SELECT id
            FROM rants
            WHERE
                content LIKE 'Just had the worst day at work%'
            LIMIT 1
        ),
        'I feel you! Bosses like that are the worst. Document everything!',
        'anon_user_016',
        NOW() - INTERVAL '1 hour 30 minutes'
    ),
    (
        (
            SELECT id
            FROM rants
            WHERE
                content LIKE 'Just had the worst day at work%'
            LIMIT 1
        ),
        'Been there. Maybe it''s time to start looking for a new job?',
        'anon_user_017',
        NOW() - INTERVAL '1 hour'
    ),
    (
        (
            SELECT id
            FROM rants
            WHERE
                content LIKE 'Just had the worst day at work%'
            LIMIT 1
        ),
        'That''s so frustrating. You deserve better recognition for your work.',
        'anon_user_018',
        NOW() - INTERVAL '45 minutes'
    ),

-- Comments for happy rant
(
    (
        SELECT id
        FROM rants
        WHERE
            content LIKE 'Feeling so grateful today%'
        LIMIT 1
    ),
    'This made me smile! Old friends are the best.',
    'anon_user_019',
    NOW() - INTERVAL '3 hours 30 minutes'
),
(
    (
        SELECT id
        FROM rants
        WHERE
            content LIKE 'Feeling so grateful today%'
        LIMIT 1
    ),
    'Love this positive energy! Thanks for sharing.',
    'anon_user_020',
    NOW() - INTERVAL '3 hours'
),

-- Comments for sad rant
(
    (
        SELECT id
        FROM rants
        WHERE
            content LIKE 'I don''t know what to do anymore%'
        LIMIT 1
    ),
    'You''re not alone. We''re all here listening. ❤️',
    'anon_user_021',
    NOW() - INTERVAL '5 hours 30 minutes'
),
(
    (
        SELECT id
        FROM rants
        WHERE
            content LIKE 'I don''t know what to do anymore%'
        LIMIT 1
    ),
    'Sending virtual hugs. It will get better, I promise.',
    'anon_user_022',
    NOW() - INTERVAL '5 hours'
),
(
    (
        SELECT id
        FROM rants
        WHERE
            content LIKE 'I don''t know what to do anymore%'
        LIMIT 1
    ),
    'Have you considered talking to a counselor? Sometimes professional help makes a huge difference.',
    'anon_user_023',
    NOW() - INTERVAL '4 hours 30 minutes'
),

-- Comments for heartbroken rant about dog
(
    (
        SELECT id
        FROM rants
        WHERE
            content LIKE 'My dog passed away today%'
        LIMIT 1
    ),
    'I''m so sorry for your loss. 12 years of love is something to cherish forever.',
    'anon_user_024',
    NOW() - INTERVAL '2 days 3 hours'
),
(
    (
        SELECT id
        FROM rants
        WHERE
            content LIKE 'My dog passed away today%'
        LIMIT 1
    ),
    'Dogs leave paw prints on our hearts. Your pup knew how much you loved them.',
    'anon_user_025',
    NOW() - INTERVAL '2 days 2 hours'
),
(
    (
        SELECT id
        FROM rants
        WHERE
            content LIKE 'My dog passed away today%'
        LIMIT 1
    ),
    'Losing a pet is losing a family member. Take all the time you need to grieve.',
    'anon_user_026',
    NOW() - INTERVAL '2 days 1 hour'
);

-- 3. TRENDING TABLE
-- Add trending scores for popular rants
INSERT INTO
    trending (
        rant_id,
        score,
        anonymous_id,
        created_at
    )
VALUES (
        (
            SELECT id
            FROM rants
            WHERE
                content LIKE 'My dog passed away today%'
            LIMIT 1
        ),
        534,
        'system_trending',
        NOW() - INTERVAL '2 days'
    ),
    (
        (
            SELECT id
            FROM rants
            WHERE
                content LIKE 'Heartbroken doesn''t even begin%'
            LIMIT 1
        ),
        279,
        'system_trending',
        NOW() - INTERVAL '1 day'
    ),
    (
        (
            SELECT id
            FROM rants
            WHERE
                content LIKE 'FINALLY got that promotion%'
            LIMIT 1
        ),
        179,
        'system_trending',
        NOW() - INTERVAL '12 hours'
    ),
    (
        (
            SELECT id
            FROM rants
            WHERE
                content LIKE 'Crying happy tears right now%'
            LIMIT 1
        ),
        223,
        'system_trending',
        NOW() - INTERVAL '1 day 10 hours'
    ),
    (
        (
            SELECT id
            FROM rants
            WHERE
                content LIKE 'Why does adulting have to be so hard%'
            LIMIT 1
        ),
        196,
        'system_trending',
        NOW() - INTERVAL '2 days'
    );

-- 4. CHALLENGES TABLE
-- Insert various challenges for users
INSERT INTO challenges (title, description, emoji, type, participants, participants_count, progress, days_left, reward, is_active, created_at) VALUES
('7-Day Gratitude Challenge', 'Share something you''re grateful for each day for a week', '🙏', 'wellness', '["anon_user_001", "anon_user_002", "anon_user_003", "anon_user_004", "anon_user_005"]'::jsonb, 5, 3, 4, '50 XP + Gratitude Badge', true, NOW() - INTERVAL '3 days'),
('Kindness Week', 'Perform one act of kindness daily and share your experience', '💝', 'community', '["anon_user_006", "anon_user_007", "anon_user_008"]'::jsonb, 3, 5, 2, '75 XP + Helper Badge', true, NOW() - INTERVAL '5 days'),
('Mindful Moments', 'Take 5 minutes each day for mindfulness and reflection', '🧘', 'wellness', '["anon_user_009", "anon_user_010", "anon_user_011", "anon_user_012"]'::jsonb, 4, 7, 0, '100 XP + Zen Master Badge', false, NOW() - INTERVAL '7 days'),
('Creative Expression', 'Share a creative thought, idea, or inspiration daily', '🎨', 'creativity', '["anon_user_013", "anon_user_014"]'::jsonb, 2, 2, 5, '60 XP + Artist Badge', true, NOW() - INTERVAL '2 days'),
('Positive Vibes Only', 'Share only positive thoughts and experiences for 5 days', '✨', 'positivity', '["anon_user_015", "anon_user_016", "anon_user_017", "anon_user_018", "anon_user_019", "anon_user_020"]'::jsonb, 6, 1, 4, '80 XP + Sunshine Badge', true, NOW() - INTERVAL '1 day');

-- 5. LEADERBOARD TABLE
-- Insert leaderboard entries for different categories
INSERT INTO
    leaderboard (
        category,
        anonymous_id,
        RANK,
        score,
        value,
        level,
        badge,
        created_at
    )
VALUES (
        'most_active',
        'anon_user_007',
        1,
        2340,
        156,
        8,
        'Champion',
        NOW() - INTERVAL '1 hour'
    ),
    (
        'most_active',
        'anon_user_015',
        2,
        2180,
        145,
        7,
        'Expert',
        NOW() - INTERVAL '1 hour'
    ),
    (
        'most_active',
        'anon_user_005',
        3,
        1890,
        126,
        6,
        'Advanced',
        NOW() - INTERVAL '1 hour'
    ),
    (
        'most_active',
        'anon_user_012',
        4,
        1650,
        110,
        6,
        'Advanced',
        NOW() - INTERVAL '1 hour'
    ),
    (
        'most_active',
        'anon_user_013',
        5,
        1420,
        95,
        5,
        'Intermediate',
        NOW() - INTERVAL '1 hour'
    ),
    (
        'most_helpful',
        'anon_user_021',
        1,
        890,
        89,
        5,
        'Helper',
        NOW() - INTERVAL '1 hour'
    ),
    (
        'most_helpful',
        'anon_user_024',
        2,
        780,
        78,
        4,
        'Supporter',
        NOW() - INTERVAL '1 hour'
    ),
    (
        'most_helpful',
        'anon_user_019',
        3,
        670,
        67,
        4,
        'Supporter',
        NOW() - INTERVAL '1 hour'
    ),
    (
        'most_helpful',
        'anon_user_022',
        4,
        560,
        56,
        3,
        'Friend',
        NOW() - INTERVAL '1 hour'
    ),
    (
        'most_helpful',
        'anon_user_025',
        5,
        450,
        45,
        3,
        'Friend',
        NOW() - INTERVAL '1 hour'
    ),
    (
        'weekly_streak',
        'anon_user_003',
        1,
        21,
        21,
        3,
        'Consistent',
        NOW() - INTERVAL '1 hour'
    ),
    (
        'weekly_streak',
        'anon_user_009',
        2,
        18,
        18,
        3,
        'Consistent',
        NOW() - INTERVAL '1 hour'
    ),
    (
        'weekly_streak',
        'anon_user_014',
        3,
        15,
        15,
        2,
        'Regular',
        NOW() - INTERVAL '1 hour'
    ),
    (
        'weekly_streak',
        'anon_user_001',
        4,
        12,
        12,
        2,
        'Regular',
        NOW() - INTERVAL '1 hour'
    ),
    (
        'weekly_streak',
        'anon_user_008',
        5,
        9,
        9,
        1,
        'Beginner',
        NOW() - INTERVAL '1 hour'
    );

-- 6. BOOKMARKS TABLE
-- Users bookmarking popular rants
INSERT INTO
    bookmarks (
        anonymous_id,
        rant_id,
        created_at
    )
VALUES (
        'anon_user_001',
        (
            SELECT id
            FROM rants
            WHERE
                content LIKE 'My dog passed away today%'
            LIMIT 1
        ),
        NOW() - INTERVAL '2 days 2 hours'
    ),
    (
        'anon_user_002',
        (
            SELECT id
            FROM rants
            WHERE
                content LIKE 'FINALLY got that promotion%'
            LIMIT 1
        ),
        NOW() - INTERVAL '11 hours'
    ),
    (
        'anon_user_003',
        (
            SELECT id
            FROM rants
            WHERE
                content LIKE 'You know what? I''m done apologizing%'
            LIMIT 1
        ),
        NOW() - INTERVAL '1 day 1 hour'
    ),
    (
        'anon_user_004',
        (
            SELECT id
            FROM rants
            WHERE
                content LIKE 'Heartbroken doesn''t even begin%'
            LIMIT 1
        ),
        NOW() - INTERVAL '23 hours'
    ),
    (
        'anon_user_005',
        (
            SELECT id
            FROM rants
            WHERE
                content LIKE 'Crying happy tears right now%'
            LIMIT 1
        ),
        NOW() - INTERVAL '1 day 9 hours'
    ),
    (
        'anon_user_006',
        (
            SELECT id
            FROM rants
            WHERE
                content LIKE 'Had an amazing date last night%'
            LIMIT 1
        ),
        NOW() - INTERVAL '2 days 1 hour'
    ),
    (
        'anon_user_007',
        (
            SELECT id
            FROM rants
            WHERE
                content LIKE 'Why does adulting have to be so hard%'
            LIMIT 1
        ),
        NOW() - INTERVAL '1 day 23 hours'
    );

-- 7. NOTIFICATIONS TABLE
-- Various notification types for users
INSERT INTO notifications (anonymous_id, type, title, message, read, data, created_at) VALUES
('anon_user_007', 'like', 'Your rant got a like!', 'Someone appreciated your heartfelt post', false, '{"rant_id": "placeholder", "liker_id": "anon_user_026"}'::jsonb, NOW() - INTERVAL '30 minutes'),
('anon_user_015', 'comment', 'New comment on your rant', 'Someone left a supportive comment on your post about your dog', false, '{"rant_id": "placeholder", "commenter_id": "anon_user_024"}'::jsonb, NOW() - INTERVAL '2 hours'),
('anon_user_006', 'achievement', 'Achievement Unlocked!', 'You earned the "Motivator" badge for inspiring others', false, '{"badge": "Motivator", "points": 50}'::jsonb, NOW() - INTERVAL '4 hours'),
('anon_user_001', 'challenge', 'Challenge Update', 'You''re doing great in the 7-Day Gratitude Challenge! 4 days to go.', true, '{"challenge_id": "placeholder", "days_left": 4}'::jsonb, NOW() - INTERVAL '6 hours'),
('anon_user_012', 'trending', 'Your rant is trending!', 'Your post about your sister''s graduation is getting lots of love', false, '{"rant_id": "placeholder", "trend_score": 223}'::jsonb, NOW() - INTERVAL '8 hours'),
('anon_user_003', 'support', 'Community Support', 'Your recent post received lots of supportive comments. You''re not alone!', true, '{"rant_id": "placeholder", "support_count": 12}'::jsonb, NOW() - INTERVAL '12 hours'),
('anon_user_009', 'milestone', 'Milestone Reached!', 'Congratulations! You''ve been part of our community for 30 days.', false, '{"milestone": "30_days", "bonus_points": 100}'::jsonb, NOW() - INTERVAL '1 day');

-- 8. SETTINGS TABLE
-- User preferences and settings
INSERT INTO settings (anonymous_id, preferences, created_at) VALUES
('anon_user_001', '{"theme": "dark", "notifications": {"likes": true, "comments": true, "achievements": true}, "privacy": {"shareAnalytics": true}, "accessibility": {"fontSize": "medium", "screenReader": false}}'::jsonb, NOW() - INTERVAL '5 days'),
('anon_user_002', '{"theme": "light", "notifications": {"likes": true, "comments": false, "achievements": true}, "privacy": {"shareAnalytics": false}, "accessibility": {"fontSize": "large", "screenReader": false}}'::jsonb, NOW() - INTERVAL '3 days'),
('anon_user_003', '{"theme": "auto", "notifications": {"likes": false, "comments": true, "achievements": true}, "privacy": {"shareAnalytics": true}, "accessibility": {"fontSize": "small", "screenReader": true}}'::jsonb, NOW() - INTERVAL '7 days'),
('anon_user_004', '{"theme": "dark", "notifications": {"likes": true, "comments": true, "achievements": false}, "privacy": {"shareAnalytics": true}, "accessibility": {"fontSize": "medium", "screenReader": false}}'::jsonb, NOW() - INTERVAL '2 days'),
('anon_user_005', '{"theme": "light", "notifications": {"likes": true, "comments": true, "achievements": true}, "privacy": {"shareAnalytics": false}, "accessibility": {"fontSize": "large", "screenReader": false}}'::jsonb, NOW() - INTERVAL '6 days');

-- 9. ANALYTICS_SESSIONS TABLE
-- User session data for analytics
INSERT INTO
    analytics_sessions (
        anonymous_id,
        first_seen,
        last_seen,
        page_views,
        events_count,
        user_agent,
        referrer,
        created_at
    )
VALUES (
        'anon_user_001',
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '30 minutes',
        15,
        23,
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'https://google.com',
        NOW() - INTERVAL '2 hours'
    ),
    (
        'anon_user_002',
        NOW() - INTERVAL '4 hours',
        NOW() - INTERVAL '1 hour',
        8,
        12,
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'https://twitter.com',
        NOW() - INTERVAL '4 hours'
    ),
    (
        'anon_user_003',
        NOW() - INTERVAL '6 hours',
        NOW() - INTERVAL '2 hours',
        22,
        34,
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
        'direct',
        NOW() - INTERVAL '6 hours'
    ),
    (
        'anon_user_004',
        NOW() - INTERVAL '8 hours',
        NOW() - INTERVAL '3 hours',
        12,
        18,
        'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0',
        'https://reddit.com',
        NOW() - INTERVAL '8 hours'
    ),
    (
        'anon_user_005',
        NOW() - INTERVAL '10 hours',
        NOW() - INTERVAL '4 hours',
        19,
        28,
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
        'https://facebook.com',
        NOW() - INTERVAL '10 hours'
    ),
    (
        'anon_user_006',
        NOW() - INTERVAL '12 hours',
        NOW() - INTERVAL '5 hours',
        25,
        41,
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
        'https://instagram.com',
        NOW() - INTERVAL '12 hours'
    ),
    (
        'anon_user_007',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '6 hours',
        31,
        47,
        'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
        'direct',
        NOW() - INTERVAL '1 day'
    );

-- 10. ANALYTICS_EVENTS TABLE
-- Detailed analytics events


INSERT INTO analytics_events (type, page, timestamp, anonymous_id, details, user_agent, referrer, created_at) VALUES
('pageview', '/', EXTRACT(EPOCH FROM NOW() - INTERVAL '2 hours') * 1000, 'anon_user_001', '{"referrer": "https://google.com"}'::jsonb, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'https://google.com', NOW() - INTERVAL '2 hours'),
('pageview', '/bookmarks', EXTRACT(EPOCH FROM NOW() - INTERVAL '1 hour 45 minutes') * 1000, 'anon_user_001', '{}'::jsonb, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', null, NOW() - INTERVAL '1 hour 45 minutes'),
('rant_posted', '/', EXTRACT(EPOCH FROM NOW() - INTERVAL '1 hour 30 minutes') * 1000, 'anon_user_001', '{"mood": "angry", "length": 142}'::jsonb, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', null, NOW() - INTERVAL '1 hour 30 minutes'),
('like_clicked', '/', EXTRACT(EPOCH FROM NOW() - INTERVAL '1 hour') * 1000, 'anon_user_001', '{"rant_id": "placeholder"}'::jsonb, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', null, NOW() - INTERVAL '1 hour'),

('pageview', '/', EXTRACT(EPOCH FROM NOW() - INTERVAL '4 hours') * 1000, 'anon_user_002', '{"referrer": "https://twitter.com"}'::jsonb, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'https://twitter.com', NOW() - INTERVAL '4 hours'),
('pageview', '/challenges', EXTRACT(EPOCH FROM NOW() - INTERVAL '3 hours 30 minutes') * 1000, 'anon_user_002', '{}'::jsonb, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', null, NOW() - INTERVAL '3 hours 30 minutes'),
('challenge_joined', '/challenges', EXTRACT(EPOCH FROM NOW() - INTERVAL '3 hours') * 1000, 'anon_user_002', '{"challenge": "gratitude"}'::jsonb, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', null, NOW() - INTERVAL '3 hours'),

('pageview', '/', EXTRACT(EPOCH FROM NOW() - INTERVAL '6 hours') * 1000, 'anon_user_003', '{}'::jsonb, 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', 'direct', NOW() - INTERVAL '6 hours'),
('rant_posted', '/', EXTRACT(EPOCH FROM NOW() - INTERVAL '5 hours 30 minutes') * 1000, 'anon_user_003', '{"mood": "sad", "length": 98}'::jsonb, 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', null, NOW() - INTERVAL '5 hours 30 minutes'),
('comment_posted', '/', EXTRACT(EPOCH FROM NOW() - INTERVAL '5 hours') * 1000, 'anon_user_003', '{"rant_id": "placeholder", "length": 45}'::jsonb, 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', null, NOW() - INTERVAL '5 hours'),

('pageview', '/leaderboard', EXTRACT(EPOCH FROM NOW() - INTERVAL '8 hours') * 1000, 'anon_user_004', '{"referrer": "https://reddit.com"}'::jsonb, 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0', 'https://reddit.com', NOW() - INTERVAL '8 hours'),
('bookmark_added', '/', EXTRACT(EPOCH FROM NOW() - INTERVAL '7 hours 30 minutes') * 1000, 'anon_user_004', '{"rant_id": "placeholder"}'::jsonb, 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0', null, NOW() - INTERVAL '7 hours 30 minutes');

-- 11. GAMIFICATION TABLE
-- User gamification data
INSERT INTO gamification (anonymous_id, points, badges, achievements, created_at) VALUES
('anon_user_001', 450, '["First Post", "Week Warrior", "Helper"]'::jsonb, '["posted_first_rant", "7_day_streak", "helped_5_users"]'::jsonb, NOW() - INTERVAL '5 days'),
('anon_user_002', 320, '["First Post", "Challenger"]'::jsonb, '["posted_first_rant", "joined_first_challenge"]'::jsonb, NOW() - INTERVAL '3 days'),
('anon_user_003', 680, '["First Post", "Supporter", "Consistent"]'::jsonb, '["posted_first_rant", "gave_10_likes", "14_day_streak"]'::jsonb, NOW() - INTERVAL '7 days'),
('anon_user_004', 290, '["First Post", "Explorer"]'::jsonb, '["posted_first_rant", "visited_all_pages"]'::jsonb, NOW() - INTERVAL '2 days'),
('anon_user_005', 520, '["First Post", "Night Owl", "Anxious Helper"]'::jsonb, '["posted_first_rant", "posted_after_midnight", "helped_anxious_users"]'::jsonb, NOW() - INTERVAL '6 days'),
('anon_user_006', 780, '["First Post", "Motivator", "Celebration Master"]'::jsonb, '["posted_first_rant", "inspired_10_users", "shared_good_news"]'::jsonb, NOW() - INTERVAL '4 days'),
('anon_user_007', 1240, '["First Post", "Heartfelt", "Community Pillar", "Trending Star"]'::jsonb, '["posted_first_rant", "emotional_support", "top_contributor", "trending_post"]'::jsonb, NOW() - INTERVAL '8 days');

-- 12. MODERATION_REPORTS TABLE
-- Sample moderation reports
INSERT INTO
    moderation_reports (
        content_id,
        content_type,
        reason,
        reporter_anonymous_id,
        status,
        created_at
    )
VALUES (
        (
            SELECT id
            FROM rants
            ORDER BY RANDOM ()
            LIMIT 1
        ),
        'rant',
        'Inappropriate language',
        'anon_user_020',
        'reviewed',
        NOW() - INTERVAL '2 days'
    ),
    (
        (
            SELECT id
            FROM comments
            ORDER BY RANDOM ()
            LIMIT 1
        ),
        'comment',
        'Spam content',
        'anon_user_021',
        'pending',
        NOW() - INTERVAL '1 day'
    ),
    (
        (
            SELECT id
            FROM rants
            ORDER BY RANDOM ()
            LIMIT 1
        ),
        'rant',
        'Harassment',
        'anon_user_022',
        'resolved',
        NOW() - INTERVAL '3 days'
    ),
    (
        (
            SELECT id
            FROM comments
            ORDER BY RANDOM ()
            LIMIT 1
        ),
        'comment',
        'Off-topic',
        'anon_user_023',
        'dismissed',
        NOW() - INTERVAL '4 days'
    );

-- 13. SUGGESTIONS TABLE
-- User suggestions for platform improvements
INSERT INTO
    suggestions (
        anonymous_id,
        title,
        description,
        category,
        priority,
        votes_up,
        votes_down,
        status,
        created_at
    )
VALUES (
        'anon_user_001',
        'Dark Mode Toggle',
        'Add a quick toggle for dark/light mode in the header instead of going to settings',
        'UI/UX',
        'Important',
        23,
        2,
        'under_review',
        NOW() - INTERVAL '5 days'
    ),
    (
        'anon_user_002',
        'Mood-based Filtering',
        'Allow users to filter rants by specific moods to find content that resonates',
        'Feature',
        'Very important',
        45,
        1,
        'approved',
        NOW() - INTERVAL '4 days'
    ),
    (
        'anon_user_003',
        'Anonymous Chat Support',
        'Add a feature for users to have private anonymous conversations for support',
        'Feature',
        'Critical',
        67,
        8,
        'in_progress',
        NOW() - INTERVAL '6 days'
    ),
    (
        'anon_user_004',
        'Better Mobile Experience',
        'The mobile app needs better touch targets and improved navigation',
        'Mobile',
        'Important',
        34,
        3,
        'pending',
        NOW() - INTERVAL '3 days'
    ),
    (
        'anon_user_005',
        'Rant Templates',
        'Provide templates or prompts to help users express their feelings better',
        'Feature',
        'Not important',
        12,
        15,
        'rejected',
        NOW() - INTERVAL '7 days'
    ),
    (
        'anon_user_006',
        'Weekly Digest',
        'Send a weekly email digest of trending rants and community highlights',
        'Communication',
        'Somewhat important',
        28,
        5,
        'under_review',
        NOW() - INTERVAL '2 days'
    ),
    (
        'anon_user_007',
        'Accessibility Improvements',
        'Better screen reader support and keyboard navigation throughout the app',
        'Accessibility',
        'Critical',
        89,
        0,
        'approved',
        NOW() - INTERVAL '8 days'
    );

-- 14. SUGGESTION_VOTES TABLE
-- Votes on the suggestions above
INSERT INTO
    suggestion_votes (
        suggestion_id,
        anonymous_id,
        vote_type,
        created_at
    )
VALUES
    -- Votes for Dark Mode Toggle
    (
        (
            SELECT id
            FROM suggestions
            WHERE
                title = 'Dark Mode Toggle'
            LIMIT 1
        ),
        'anon_user_010',
        'up',
        NOW() - INTERVAL '4 days 12 hours'
    ),
    (
        (
            SELECT id
            FROM suggestions
            WHERE
                title = 'Dark Mode Toggle'
            LIMIT 1
        ),
        'anon_user_011',
        'up',
        NOW() - INTERVAL '4 days 6 hours'
    ),
    (
        (
            SELECT id
            FROM suggestions
            WHERE
                title = 'Dark Mode Toggle'
            LIMIT 1
        ),
        'anon_user_012',
        'down',
        NOW() - INTERVAL '4 days'
    ),

-- Votes for Mood-based Filtering
(
    (
        SELECT id
        FROM suggestions
        WHERE
            title = 'Mood-based Filtering'
        LIMIT 1
    ),
    'anon_user_013',
    'up',
    NOW() - INTERVAL '3 days 18 hours'
),
(
    (
        SELECT id
        FROM suggestions
        WHERE
            title = 'Mood-based Filtering'
        LIMIT 1
    ),
    'anon_user_014',
    'up',
    NOW() - INTERVAL '3 days 12 hours'
),
(
    (
        SELECT id
        FROM suggestions
        WHERE
            title = 'Mood-based Filtering'
        LIMIT 1
    ),
    'anon_user_015',
    'up',
    NOW() - INTERVAL '3 days 6 hours'
),

-- Votes for Anonymous Chat Support
(
    (
        SELECT id
        FROM suggestions
        WHERE
            title = 'Anonymous Chat Support'
        LIMIT 1
    ),
    'anon_user_016',
    'up',
    NOW() - INTERVAL '5 days 12 hours'
),
(
    (
        SELECT id
        FROM suggestions
        WHERE
            title = 'Anonymous Chat Support'
        LIMIT 1
    ),
    'anon_user_017',
    'up',
    NOW() - INTERVAL '5 days 6 hours'
),
(
    (
        SELECT id
        FROM suggestions
        WHERE
            title = 'Anonymous Chat Support'
        LIMIT 1
    ),
    'anon_user_018',
    'down',
    NOW() - INTERVAL '5 days'
),

-- Votes for Accessibility Improvements
(
    (
        SELECT id
        FROM suggestions
        WHERE
            title = 'Accessibility Improvements'
        LIMIT 1
    ),
    'anon_user_019',
    'up',
    NOW() - INTERVAL '7 days 12 hours'
),
(
    (
        SELECT id
        FROM suggestions
        WHERE
            title = 'Accessibility Improvements'
        LIMIT 1
    ),
    'anon_user_020',
    'up',
    NOW() - INTERVAL '7 days 6 hours'
),
(
    (
        SELECT id
        FROM suggestions
        WHERE
            title = 'Accessibility Improvements'
        LIMIT 1
    ),
    'anon_user_021',
    'up',
    NOW() - INTERVAL '7 days'
);

-- Update rants table with correct like counts based on our sample data
UPDATE rants
SET
    likes_count = 25
WHERE
    content LIKE 'Just had the worst day at work%';

UPDATE rants
SET
    likes_count = 47
WHERE
    content LIKE 'Feeling so grateful today%';

UPDATE rants
SET
    likes_count = 89
WHERE
    content LIKE 'I don''t know what to do anymore%';

UPDATE rants
SET
    likes_count = 156
WHERE
    content LIKE 'FINALLY got that promotion%';

UPDATE rants
SET
    likes_count = 234
WHERE
    content LIKE 'Heartbroken doesn''t even begin%';

UPDATE rants
SET
    likes_count = 456
WHERE
    content LIKE 'My dog passed away today%';

-- Update comments count based on actual comments inserted
UPDATE rants
SET
    comments_count = (
        SELECT COUNT(*)
        FROM comments
        WHERE
            comments.rant_id = rants.id
    );

-- Create some indexes for better performance (optional)
CREATE INDEX IF NOT EXISTS idx_rants_mood ON rants (mood);

CREATE INDEX IF NOT EXISTS idx_rants_created_at ON rants (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_rant_id ON comments (rant_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(type);

CREATE INDEX IF NOT EXISTS idx_analytics_events_anonymous_id ON analytics_events (anonymous_id);

CREATE INDEX IF NOT EXISTS idx_trending_score ON trending (score DESC);

-- Display summary of inserted data
SELECT 'rants' AS table_name, COUNT(*) AS record_count
FROM rants
UNION ALL
SELECT 'comments', COUNT(*)
FROM comments
UNION ALL
SELECT 'trending', COUNT(*)
FROM trending
UNION ALL
SELECT 'challenges', COUNT(*)
FROM challenges
UNION ALL
SELECT 'leaderboard', COUNT(*)
FROM leaderboard
UNION ALL
SELECT 'bookmarks', COUNT(*)
FROM bookmarks
UNION ALL
SELECT 'notifications', COUNT(*)
FROM notifications
UNION ALL
SELECT 'settings', COUNT(*)
FROM settings
UNION ALL
SELECT 'analytics_sessions', COUNT(*)
FROM analytics_sessions
UNION ALL
SELECT 'analytics_events', COUNT(*)
FROM analytics_events
UNION ALL
SELECT 'gamification', COUNT(*)
FROM gamification
UNION ALL
SELECT 'moderation_reports', COUNT(*)
FROM moderation_reports
UNION ALL
SELECT 'suggestions', COUNT(*)
FROM suggestions
UNION ALL
SELECT 'suggestion_votes', COUNT(*)
FROM suggestion_votes
ORDER BY table_name;
