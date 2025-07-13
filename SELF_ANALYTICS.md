# Self Analytics

A privacy-friendly, in-house analytics system for the Rant platform.

---

## Overview

This document outlines a plan to build a simple, privacy-first analytics system for Rant. The goal is to track essential engagement and usage metrics without relying on third-party services or compromising user privacy. The analytics will be integrated into the admin dashboard for easy access and visualization.

---

## 1. What to Track?

- **Page Views:** Which pages are visited, and how often.
- **Unique Visitors:** Anonymous, no cookies or persistent identifiers unless necessary.
- **User Actions:** Key actions such as posting, liking, bookmarking, etc.
- **Device/Browser Info:** (Optional) For troubleshooting and optimization.
- **Referrer/Source:** (Optional) To understand traffic sources.

---

## 2. How to Track?

- **Frontend:**
  - Send events to the backend via fetch/XHR (e.g., POST to `/api/analytics`).
  - Trigger on page load (pageview) and on key user actions (like, post, etc.).
- **Backend:**
  - Receive and store events in a database (Postgres, SQLite, or even a JSON file for MVP).
- **Admin Dashboard:**
  - Query and visualize analytics data (charts, tables, etc.).

---

## 3. Implementation Plan

### A. Analytics API Route
- Create a Next.js API route (e.g., `/api/analytics`).
- Accept POST requests with event data (type, page, timestamp, etc.).
- Store events in a database.

### B. Frontend Event Tracking
- On page load, send a pageview event:
  ```js
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'pageview', page: window.location.pathname, timestamp: Date.now() })
  });
  ```
- On key actions (like, post, etc.), send action events with relevant details.

### C. Database Schema (Example: analytics_events)
| Column     | Type      | Description                        |
|------------|-----------|------------------------------------|
| id         | SERIAL    | Primary key                        |
| type       | TEXT      | Event type (pageview, like, post)  |
| page       | TEXT      | Page path                          |
| timestamp  | DATETIME  | Event timestamp                    |
| user_id    | TEXT      | Optional, for logged-in users      |
| details    | JSON      | Optional, extra event details      |

### D. Admin Dashboard Integration
- Add a new page (e.g., `/admin/analytics`).
- Query the analytics table for stats (e.g., total pageviews, most popular pages, action counts).
- Display data using charts (Chart.js, Recharts, etc.) and tables.
- Allow filtering by date range, event type, etc.

---

## 4. Privacy Considerations

- **No cookies or persistent identifiers** unless absolutely necessary.
- **No IP address or personal data** collection.
- **Aggregate data** for trends, not for tracking individual users.
- **Respect DNT (Do Not Track)** headers if present.

---

## 5. Future Enhancements

- Real-time analytics dashboard.
- Custom event types for new features.
- Export analytics data (CSV, JSON).
- Alerts for unusual activity or traffic spikes.
- Integration with other admin tools.

---

## 6. Next Steps

- [ ] Decide on the database/storage solution.
- [ ] Design the API route and event schema.
- [ ] Implement frontend event tracking hooks.
- [ ] Build the admin dashboard analytics page.
- [ ] Test for privacy compliance and performance.

---

**This document will serve as the implementation guide for Self Analytics when we prioritize this feature in the future.**
