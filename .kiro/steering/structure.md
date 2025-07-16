---
inclusion: always
---

# Project Structure & Architecture

## Directory Organization

### `/app` - Next.js App Router
- `layout.tsx` - Root layout with metadata, analytics, global providers
- `page.tsx` - Main feed page (client component with full app logic)
- `globals.css` - Global styles and CSS variables
- `/[feature]` - Feature-based route folders (bookmarks, challenges, leaderboard)
- Each route: `page.tsx` + optional `[Feature]Client.tsx` for client logic

### `/components` - React Components
- `/ui` - shadcn/ui components (button, card, dialog, etc.)
- Feature components - `enhanced-rant-card.tsx`, `post-rant-modal.tsx`
- Layout components - `Header.tsx`, `ClientLayout.tsx`, `sidebar-content.tsx`
- Specialized - `masonry-grid.tsx`, `infinite-scroll.tsx`

### `/hooks` - Custom React Hooks
- Settings: `use-settings.ts`, `use-theme.ts`, `use-accessibility.ts`
- Features: `use-gamification.ts`, `use-notifications.ts`, `use-filtered-rants.ts`
- Utilities: `use-mobile.tsx`, `use-keyboard-shortcuts.ts`

### `/lib` - Utility Libraries
- `utils.ts` - Core utilities (cn, getAnonymousId, normalizeRant)
- `storage.ts` - Local storage abstraction
- `self-analytics.ts` - Analytics tracking

### `/services` - Business Logic Services
- `content-moderation.ts` - Content filtering and moderation
- `sentiment-analysis.ts` - Mood and sentiment detection
- `personalization.ts` - Recommendation algorithms
- `audio-service.ts` - Sound effects and audio feedback

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
