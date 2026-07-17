-- Demo seed content for the Rant showcase.
-- Timestamps are relative to seed time so the feed always looks recent.
-- All rows are marked is_seed = 1 so a reset can distinguish them from visitor posts.

DELETE FROM comments      WHERE is_seed = 1;
DELETE FROM rants         WHERE is_seed = 1;
DELETE FROM group_members WHERE is_seed = 1;
DELETE FROM groups        WHERE is_seed = 1;

INSERT INTO groups (id, name, description, mood, created_by, created_at, is_seed) VALUES
('seed-group-01', 'Work Rants', 'Meetings that could have been emails, managers, deadlines — let it out.', 'angry', 'anon_9to5', strftime('%Y-%m-%dT%H:%M:%fZ','now','-6 days'), 1),
('seed-group-02', 'Small Wins', 'Celebrate the little victories nobody else claps for.', 'excited', 'anon_gains', strftime('%Y-%m-%dT%H:%M:%fZ','now','-5 days'), 1),
('seed-group-03', 'Midnight Thoughts', 'For the 3am overthinkers. You are not alone in here.', 'anxious', 'anon_nightowl', strftime('%Y-%m-%dT%H:%M:%fZ','now','-4 days'), 1);

INSERT INTO group_members (group_id, anonymous_id, joined_at, is_seed) VALUES
('seed-group-01', 'anon_9to5',        strftime('%Y-%m-%dT%H:%M:%fZ','now','-6 days'), 1),
('seed-group-01', 'anon_devlife',     strftime('%Y-%m-%dT%H:%M:%fZ','now','-5 days'), 1),
('seed-group-01', 'anon_burntout',    strftime('%Y-%m-%dT%H:%M:%fZ','now','-3 days'), 1),
('seed-group-02', 'anon_gains',       strftime('%Y-%m-%dT%H:%M:%fZ','now','-5 days'), 1),
('seed-group-02', 'anon_finally',     strftime('%Y-%m-%dT%H:%M:%fZ','now','-4 days'), 1),
('seed-group-02', 'anon_student',     strftime('%Y-%m-%dT%H:%M:%fZ','now','-2 days'), 1),
('seed-group-03', 'anon_nightowl',    strftime('%Y-%m-%dT%H:%M:%fZ','now','-4 days'), 1),
('seed-group-03', 'anon_overthinker', strftime('%Y-%m-%dT%H:%M:%fZ','now','-3 days'), 1);

INSERT INTO rants (id, content, mood, likes_count, comments_count, anonymous_id, tags, created_at, is_seed) VALUES
('seed-rant-01', 'Just spent three hours debugging only to realize I never saved the file. I am the problem. It was me.', 'tired', 47, 2, 'anon_devlife', '["coding","work"]', strftime('%Y-%m-%dT%H:%M:%fZ','now','-35 minutes'), 1),
('seed-rant-02', 'Got the job offer today after six months of searching. Crying happy tears in my car right now.', 'excited', 132, 2, 'anon_finally', '["career","wins"]', strftime('%Y-%m-%dT%H:%M:%fZ','now','-2 hours'), 1),
('seed-rant-03', 'Why does everyone act like being busy is a personality trait? I just want to rest without feeling guilty.', 'angry', 88, 1, 'anon_burntout', '["mentalhealth","hustle"]', strftime('%Y-%m-%dT%H:%M:%fZ','now','-4 hours'), 1),
('seed-rant-04', 'My cat knocked my coffee onto my keyboard and looked me dead in the eyes while doing it. We are not okay.', 'confused', 210, 1, 'anon_catparent', '["pets","mondays"]', strftime('%Y-%m-%dT%H:%M:%fZ','now','-6 hours'), 1),
('seed-rant-05', 'I miss my grandmother today. She would have known exactly what to say about all of this.', 'heartbroken', 156, 1, 'anon_missingyou', '["family","grief"]', strftime('%Y-%m-%dT%H:%M:%fZ','now','-8 hours'), 1),
('seed-rant-06', 'Finally hit the gym five days in a row. Small win but I am genuinely proud of myself.', 'happy', 74, 0, 'anon_gains', '["fitness","selfcare"]', strftime('%Y-%m-%dT%H:%M:%fZ','now','-10 hours'), 1),
('seed-rant-07', 'Anyone else feel like adulthood is just googling how to do things you were supposed to already know?', 'neutral', 301, 2, 'anon_winging_it', '["adulting","relatable"]', strftime('%Y-%m-%dT%H:%M:%fZ','now','-13 hours'), 1),
('seed-rant-08', 'My manager scheduled a meeting to tell us we are having too many meetings. Let that sink in.', 'angry', 189, 1, 'anon_9to5', '["work","corporate"]', strftime('%Y-%m-%dT%H:%M:%fZ','now','-16 hours'), 1),
('seed-rant-09', 'Started therapy this month and honestly it is the best thing I have ever done for myself.', 'love', 245, 1, 'anon_healing', '["mentalhealth","growth"]', strftime('%Y-%m-%dT%H:%M:%fZ','now','-20 hours'), 1),
('seed-rant-10', 'The anxiety of waiting for a text back is a special kind of torture nobody warns you about.', 'anxious', 118, 0, 'anon_overthinker', '["dating","anxiety"]', strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 day'), 1),
('seed-rant-11', 'I cried during a cereal commercial today. No context. Just vibes. Hormones are wild.', 'crying', 93, 0, 'anon_softheart', '["feelings","relatable"]', strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 day','-3 hours'), 1),
('seed-rant-12', 'Passed my final exam I was convinced I failed. Screaming into a pillow with joy.', 'excited', 167, 1, 'anon_student', '["school","wins"]', strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 day','-7 hours'), 1),
('seed-rant-13', 'Some days I feel like I am doing great and other days I forget how to reply to a simple email. Balance.', 'confused', 142, 0, 'anon_average', '["adulting","mentalhealth"]', strftime('%Y-%m-%dT%H:%M:%fZ','now','-2 days'), 1),
('seed-rant-14', 'Reminder to anyone reading this at 3am: you are doing better than you think. Get some rest.', 'love', 388, 2, 'anon_nightowl', '["kindness","support"]', strftime('%Y-%m-%dT%H:%M:%fZ','now','-2 days','-5 hours'), 1);

-- Post a few seed rants into groups so group feeds have content.
UPDATE rants SET group_id = 'seed-group-01' WHERE is_seed = 1 AND id IN ('seed-rant-01','seed-rant-03','seed-rant-08');
UPDATE rants SET group_id = 'seed-group-02' WHERE is_seed = 1 AND id IN ('seed-rant-02','seed-rant-06','seed-rant-12');
UPDATE rants SET group_id = 'seed-group-03' WHERE is_seed = 1 AND id IN ('seed-rant-10','seed-rant-14');

INSERT INTO comments (id, rant_id, content, anonymous_id, likes_count, created_at, is_seed) VALUES
('seed-cmt-01', 'seed-rant-01', 'This is painfully relatable. Ctrl+S is now muscle memory for me out of pure trauma.', 'anon_reply1', 12, strftime('%Y-%m-%dT%H:%M:%fZ','now','-20 minutes'), 1),
('seed-cmt-02', 'seed-rant-01', 'We have all been there friend. Take a break, you earned it.', 'anon_reply2', 5, strftime('%Y-%m-%dT%H:%M:%fZ','now','-10 minutes'), 1),
('seed-cmt-03', 'seed-rant-02', 'CONGRATULATIONS! Six months of grit paid off. So happy for you!', 'anon_reply3', 24, strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 hour'), 1),
('seed-cmt-04', 'seed-rant-02', 'Go celebrate tonight, you absolutely deserve this.', 'anon_reply4', 9, strftime('%Y-%m-%dT%H:%M:%fZ','now','-40 minutes'), 1),
('seed-cmt-05', 'seed-rant-03', 'Rest is productive too. Do not let anyone guilt you out of it.', 'anon_reply5', 18, strftime('%Y-%m-%dT%H:%M:%fZ','now','-3 hours'), 1),
('seed-cmt-06', 'seed-rant-04', 'The eye contact is what makes it a declaration of war. Stay strong.', 'anon_reply6', 31, strftime('%Y-%m-%dT%H:%M:%fZ','now','-5 hours'), 1),
('seed-cmt-07', 'seed-rant-05', 'Sending you so much love. Grandmothers leave a hole nothing quite fills.', 'anon_reply7', 27, strftime('%Y-%m-%dT%H:%M:%fZ','now','-7 hours'), 1),
('seed-cmt-08', 'seed-rant-07', 'Adulthood is 90 percent googling and 10 percent pretending you did not have to.', 'anon_reply8', 40, strftime('%Y-%m-%dT%H:%M:%fZ','now','-12 hours'), 1),
('seed-cmt-09', 'seed-rant-07', 'I felt this in my soul. Yesterday I googled how to boil an egg. No shame.', 'anon_reply9', 15, strftime('%Y-%m-%dT%H:%M:%fZ','now','-11 hours'), 1),
('seed-cmt-10', 'seed-rant-08', 'The irony is almost artistic. Could have been an email, obviously.', 'anon_reply10', 22, strftime('%Y-%m-%dT%H:%M:%fZ','now','-15 hours'), 1),
('seed-cmt-11', 'seed-rant-09', 'Proud of you for taking that step. It genuinely changes everything.', 'anon_reply11', 33, strftime('%Y-%m-%dT%H:%M:%fZ','now','-19 hours'), 1),
('seed-cmt-12', 'seed-rant-12', 'That post-exam relief is unmatched. Well done!', 'anon_reply12', 8, strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 day','-6 hours'), 1),
('seed-cmt-13', 'seed-rant-14', 'Needed to read this exactly right now. Thank you, stranger.', 'anon_reply13', 51, strftime('%Y-%m-%dT%H:%M:%fZ','now','-2 days','-4 hours'), 1),
('seed-cmt-14', 'seed-rant-14', 'Saving this one. Goodnight everybody.', 'anon_reply14', 19, strftime('%Y-%m-%dT%H:%M:%fZ','now','-2 days','-3 hours'), 1);
