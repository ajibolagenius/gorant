---
inclusion: always
---

# Project Structure & Architecture

## Directory Organization

### `/app` - Next.js App Router
- `layout.tsx` - Root layout with metadata, analytics, global providers
- `page.tsx` - Main feed page (client component with full app logic)
- `globals.css` - Global styles and CSS variables
- `loading.tsx` - Global loading component
- Favicon and PWA assets (favicon.ico, apple-touch-icon.png, site.webmanifest, etc.)
- Feature routes:
  - `/about` - About page
  - `/admin` - Admin dashboard and management
  - `/api` - API routes and endpoints
  - `/bookmarks` - User bookmarks
  - `/challenges` - Gamification challenges
  - `/guidelines` - Community guidelines
  - `/leaderboard` - User leaderboard
  - `/notifications` - User notifications
  - `/privacy` - Privacy policy
  - `/roadmap` - Product roadmap
  - `/settings` - User settings
  - `/terms-of-service` - Terms of service
  - `/test-charts` - Analytics testing
  - `/trending` - Trending content

### `/components` - React Components
- `/ui` - shadcn/ui components (button, card, dialog, etc.)
- `/analytics` - Analytics-specific components
- `/rant-app` - Core rant application components
- Layout components:
  - `Header.tsx` - Main navigation header
  - `ClientLayout.tsx` - Client-side layout wrapper
  - `sidebar-content.tsx` - Sidebar navigation content
- Content components:
  - `enhanced-rant-card.tsx` - Enhanced rant display card
  - `rant-card.tsx` - Basic rant card component
  - `post-rant-modal.tsx` - Rant creation modal
  - `masonry-grid.tsx` - Masonry layout for content
  - `infinite-scroll.tsx` - Infinite scrolling implementation
- Feature components:
  - `filter-panel.tsx` - Content filtering interface
  - `gamification-panel.tsx` - Gamification UI elements
  - `notification-list.tsx` - Notifications display
  - `analytics-consent.tsx` - Analytics consent management
  - `audio-settings.tsx` - Audio preferences
  - `theme-provider.tsx` - Theme context provider
  - `error-boundary.tsx` - Error handling boundary

### `/hooks` - Custom React Hooks
- Settings and preferences:
  - `use-settings.ts` - User settings management
  - `use-theme.ts` - Theme switching and persistence
  - `use-accessibility.ts` - Accessibility preferences
- Features:
  - `use-gamification.ts` - Gamification state and actions
  - `use-notifications.ts` - Notification management
  - `use-filtered-rants.ts` - Content filtering logic
  - `use-anonymous-user.ts` - Anonymous user management
- Analytics hooks:
  - `use-analytics.ts` - Main analytics tracking
  - `use-analytics-metrics.ts` - Analytics metrics collection
  - `use-analytics-pagination.ts` - Analytics data pagination
  - `use-content-performance-data.ts` - Content performance tracking
  - `use-dashboard-data.ts` - Dashboard data management
  - `use-user-metrics.ts` - User-specific metrics
- Utilities:
  - `use-mobile.tsx` - Mobile device detection
  - `use-keyboard-shortcuts.ts` - Keyboard shortcut handling
  - `use-debounced-search.ts` - Debounced search functionality
  - `use-toast.ts` - Toast notification management

### `/lib` - Utility Libraries
- `utils.ts` - Core utilities (cn, getAnonymousId, normalizeRant)
- `storage.ts` - Local storage abstraction
- `supabaseClient.ts` - Supabase client configuration
- `constants.ts` - Application constants and configuration
- `mood-factory.ts` - Mood-related utilities and factories
- `admin-auth.ts` - Admin authentication utilities
- Analytics modules:
  - `self-analytics.ts` - Main analytics tracking
  - `analytics-api.ts` - Analytics API layer
  - `analytics-cache.ts` - Analytics caching mechanisms
  - `analytics-config.ts` - Analytics configuration
  - `analytics-db.ts` - Database analytics operations
  - `analytics-performance.ts` - Performance analytics
  - `analytics-privacy.ts` - Privacy-compliant analytics

### `/services` - Business Logic Services
- `content-moderation.ts` - Content filtering and moderation
- `sentiment-analysis.ts` - Mood and sentiment detection
- `personalization.ts` - Recommendation algorithms
- `audio-service.ts` - Sound effects and audio feedback
- `rant-service.ts` - Core rant operations and business logic

### `/supabase` - Database and Backend
- `config.toml` - Supabase configuration
- `/migrations` - Database migration files
- `/.temp` - Temporary Supabase files

### `/scripts` - Utility Scripts
- `data_seeding.sql` - Database seeding script
- `populate-analytics-data.js` - Analytics data population
- `run-analytics-aggregation.ts` - Analytics data aggregation
- `run-analytics-tests.sh` - Analytics testing script

### `/types` - TypeScript Type Definitions
- `analytics.ts` - Analytics-related type definitions

### `/data` - Static Data and Content
- `/docs` - Documentation files
- Static data files for the application

### `/public` - Static Assets
- `/data` - Public data files
- `robots.txt` - Search engine crawler instructions
- `sitemap.xml` - Site structure for search engines
- `logo.svg` - Application logo
- `app_screenshot.png` - Application screenshot

## Architecture Patterns

### Component Architecture
- **Client/Server separation** - Server components for layouts, client for interactivity
- **Compound components** - Break complex UI into focused, composable pieces
- **Hook-based state** - Custom hooks for feature-specific state management
- **Service layer** - Business logic separated from UI components

### File Naming Conventions
- **PascalCase** - React components (`EnhancedRantCard.tsx`)
- **kebab-case** - UI components (`enhanced-rant-card.tsx`)
- **camelCase** - Utilities and hooks (`use-settings.ts`)
- **UPPERCASE** - Constants and environment variables

### State Management Strategy
- **Local state** - useState for component-specific state
- **Custom hooks** - Shared state logic across components
- **Local storage** - Persistent user preferences and anonymous data
- **Zustand** - Global application state (minimal usage)

### Styling Conventions
- **Tailwind utility-first** - Primary styling approach
- **CVA variants** - Component style variants with class-variance-authority
- **CSS variables** - Theme colors and design tokens in globals.css
- **Mobile-first responsive** - Design for mobile, enhance for desktop
