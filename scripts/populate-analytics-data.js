#!/usr/bin/env node

/**
 * Script to populate analytics data for testing
 */

const API_BASE = 'http://localhost:3000/api/analytics';

// Generate realistic test data
const sessions = [
    'session_001', 'session_002', 'session_003', 'session_004', 'session_005',
    'session_006', 'session_007', 'session_008', 'session_009', 'session_010'
];

const pages = [
    '/', '/bookmarks', '/challenges', '/leaderboard', '/trending',
    '/settings', '/about', '/admin', '/notifications', '/roadmap'
];

const eventTypes = [
    'pageview', 'rant_posted', 'like_clicked', 'comment_posted',
    'bookmark_added', 'challenge_joined', 'user_action'
];

const userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
    'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0'
];

const referrers = [
    'https://google.com', 'https://twitter.com', 'https://reddit.com',
    'https://hackernews.com', 'direct', null
];

// Generate events over the last 7 days
function generateEvents() {
    const events = [];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Generate events for the last 7 days
    for (let day = 0; day < 7; day++) {
        const dayStart = now - (day * oneDay);
        const eventsPerDay = Math.floor(Math.random() * 50) + 20; // 20-70 events per day

        for (let i = 0; i < eventsPerDay; i++) {
            const sessionId = sessions[Math.floor(Math.random() * sessions.length)];
            const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            const page = pages[Math.floor(Math.random() * pages.length)];
            const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
            const referrer = referrers[Math.floor(Math.random() * referrers.length)];

            // Random time within the day
            const timestamp = dayStart - Math.floor(Math.random() * oneDay);

            const event = {
                type: eventType,
                page: page,
                timestamp: timestamp,
                sessionId: sessionId,
                details: {
                    contentType: eventType === 'pageview' ? 'page' : 'rant',
                    source: 'web'
                },
                userAgent: userAgent,
                referrer: referrer,
                dnt: Math.random() > 0.9 // 10% have DNT enabled
            };

            events.push(event);
        }
    }

    return events;
}

// Send events to API
async function sendEvents(events) {
    console.log(`Sending ${events.length} events to analytics API...`);

    // Send in batches of 10
    const batchSize = 10;
    for (let i = 0; i < events.length; i += batchSize) {
        const batch = events.slice(i, i + batchSize);

        try {
            const response = await fetch(API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ events: batch }),
            });

            if (!response.ok) {
                console.error(`Batch ${Math.floor(i / batchSize) + 1} failed:`, response.status);
                const errorText = await response.text();
                console.error('Error details:', errorText);
            } else {
                const result = await response.json();
                console.log(`Batch ${Math.floor(i / batchSize) + 1} sent successfully:`, result);
            }
        } catch (error) {
            console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
        }

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

// Main function
async function main() {
    console.log('Generating test analytics data...');
    const events = generateEvents();

    console.log(`Generated ${events.length} events`);
    console.log('Sample event:', JSON.stringify(events[0], null, 2));

    await sendEvents(events);

    console.log('Done! Check the analytics dashboard to see the data.');
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { generateEvents, sendEvents };
