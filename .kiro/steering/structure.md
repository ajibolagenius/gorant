# Project Structure

## Directory Organization

### `/app` - Next.js App Router
- **`layout.tsx`** - Root layout with metadata, analytics, and global providers
- **`page.tsx`** - Main feed page (client component with full app logic)
- **`globals.css`** - Global styles and CSS variables
- **`/[feature]`** - Feature-based route folders (bookmarks, challenges, leaderboard, etc.)
- Each route has `page.tsx` and optional `[Feature]Client.tsx` for client logic

### `/components` - React Components
- **`/ui`** - shadcn/ui components (button, card, dialog, etc.)
- **Feature components** - Enhanced components like `enhanced-rant-card.tsx`, `post-rant-modal.tsx`
- **Layout components** - `Header.tsx`, `ClientLayout.tsx`, `sidebar-content.tsx`
- **Specialized components** - `masonry-grid.tsx`, `infinite-scroll.tsx`, etc.

### `/hooks` - Custom React Hooks
- **Settings hooks** - `use-settings.ts`, `use-theme.ts`, `use-accessibility.ts`
- **Feature hooks** - `use-gamification.ts`, `use-notifications.ts`, `use-filtered-rants.ts`
- **Utility hooks** - `use-mobile.tsx`, `use-keyboard-shortcuts.ts`

### `/lib` - Utility Libraries
- **`utils.ts`** - Core utilities (cn, getAnonymousId, normalizeRant)
- **`storage.ts`** - Local storage abstraction
- **`self-analytics.ts`** - Analytics tracking

### `/services` - Business Logic Services
- **`content-moderation.ts`** - Content filtering and moderation
- **`sentiment-analysis.ts`** - Mood and sentiment detection
- **`personalization.ts`** - Recommendation algorithms
- **`audio-service.ts`** - Sound effects and audio feedback

### `/data` - Static Data & Documentation
- **`/docs`** - Project documentation (design system, analytics, tools)

### `/scripts` - Database & Setup Scripts
- SQL files for database schema and seeding

## Architecture Patterns

### Component Patterns
- **Client/Server separation** - Server components for layouts, client components for interactivity
- **Compound components** - Complex UI broken into smaller, focused components
- **Hook-based state** - Custom hooks for feature-specific state management
- **Service layer** - Business logic separated into service classes

### File Naming Conventions
- **PascalCase** for React components (`EnhancedRantCard.tsx`)
- **kebab-case** for UI components (`enhanced-rant-card.tsx`)
- **camelCase** for utilities and hooks (`use-settings.ts`)
- **UPPERCASE** for constants and environment variables

### State Management
- **Local state** - useState for component-specific state
- **Custom hooks** - Shared state logic across components
- **Local storage** - Persistent user preferences and data
- **Zustand** - Global application state (when needed)

### Styling Approach
- **Tailwind classes** - Utility-first styling
- **CVA variants** - Component style variants
- **CSS variables** - Theme colors and design tokens
- **Responsive design** - Mobile-first approach with breakpoints
