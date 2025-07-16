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
