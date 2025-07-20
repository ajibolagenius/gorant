---
inclusion: always
---

# Product Overview

**Rant** is an anonymous social platform where users express thoughts, frustrations, and emotions in a safe, supportive environment.

## Core Features & Implementation Guidelines

### Anonymous Expression
- Users post rants without revealing identity, categorized by mood
- Use anonymous user IDs generated client-side for consistency
- Mood selection drives UI theming and content categorization
- Content moderation service filters inappropriate content
- Rich text editing with React Quill WYSIWYG editor
- Markdown support for content rendering

### Gamification System
- User levels, XP points, achievement badges, leaderboards, and challenges
- Implement using `use-gamification.ts` hook for state management
- Store progress in local storage for persistence
- Use canvas-confetti for achievement celebrations
- Audio feedback via howler for user actions

### Smart Organization
- Tag-based categorization with auto-suggestion
- Mood filtering with visual indicators
- Trending algorithm based on engagement metrics
- Advanced search with fuzzy matching

### Community Interaction
- Like/comment system with real-time updates
- Bookmarking with local storage persistence
- Sharing functionality with privacy considerations
- Infinite scroll with virtualization for performance
- Notification system for user engagement
- Advanced filtering and search capabilities
- Trending content discovery

## UI/UX Conventions

### Design Patterns
- Masonry grid layout for content display
- Card-based design with enhanced rant cards
- Modal overlays for post creation and detailed views
- Responsive sidebar navigation with collapsible sections

### Interaction Patterns
- Smooth animations using Framer Motion and GSAP
- Keyboard shortcuts for power users
- Accessibility-first design with ARIA labels
- Mobile-first responsive design

### Content Guidelines
- Mood-based color theming (angry=red, sad=blue, happy=green, etc.)
- Duotone Phosphor icons throughout the interface
- Consistent spacing using Tailwind's design system
- Dark/light theme support with CSS variables

## Data Flow & State Management

### Client-Side State
- Use Zustand for global app state
- Custom hooks for feature-specific state (settings, notifications, gamification)
- Local storage for user preferences and anonymous data
- React Hook Form with Zod validation for forms

### Content Management
- Sentiment analysis service for mood detection
- Personalization service for content recommendations
- Content moderation with automated filtering
- Real-time updates via Supabase subscriptions
- Comprehensive analytics and performance tracking
- Admin dashboard for content management and moderation
- Privacy-compliant analytics with user consent management

## Current Feature Implementation Status

### Completed Features (Phase 1-2)
- ✅ Anonymous feed with likes/upvotes and bookmarks
- ✅ Responsive UI/UX with dark mode support
- ✅ Leaderboard and gamification challenges
- ✅ Notification system (UI and functionality)
- ✅ Manual content moderation tools
- ✅ Comprehensive analytics dashboard
- ✅ Advanced search and filtering
- ✅ WYSIWYG editor for rich content creation
- ✅ Keyboard shortcuts for power users
- ✅ Smooth animations and transitions
- ✅ User preferences and settings
- ✅ Mobile-responsive hamburger navigation
- ✅ Self-analytics integration with privacy controls
- ✅ Admin dashboard with management tools
- ✅ Roadmap page for transparency
- ✅ Content reporting and moderation tools

### In Development (Phase 3-4)
- 🚧 Community groups (spec created)
- 🚧 SEO and metadata optimization (spec created)
- ⏳ User profiles and following system
- ⏳ Enhanced deployment and CI/CD
- ⏳ Performance monitoring and scalability

### Planned Features (Phase 5+)
- 📋 Monetization features (ads, donations, subscriptions)
- 📋 Progressive Web App capabilities
- 📋 AI-powered features (suggestions, sentiment analysis)
- 📋 Multi-language support
- 📋 Video and drawing support

## Development Conventions

### Component Architecture
- Separate client/server components clearly
- Use compound component patterns for complex UI
- Service layer for business logic separation
- Hook-based state management over prop drilling

### Performance Considerations
- Virtualization for large lists (react-window)
- Image optimization disabled in Next.js config
- Lazy loading for non-critical components
- Debounced search and filtering
