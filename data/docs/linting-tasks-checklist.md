# Linting & Code Quality Tasks Checklist

A categorized, actionable checklist for resolving current ESLint errors and warnings in the codebase. Check off each item as you complete it.

---

## 1. TypeScript `any` Usage Errors
- [ ] Replace all `any` types with specific types for better type safety.
  - Affected files: `app/about/page.tsx`, `app/api/analytics/route.ts`, `app/api/og/route.ts`, `app/page.tsx`, `global.d.ts`, `hooks/use-accessibility.ts`, `hooks/use-gamification.ts`, `lib/__tests__/analytics-performance-load.test.ts`, `lib/__tests__/analytics-validation.test.ts`, `lib/analytics-cache.ts`, `lib/analytics-db.ts`, `lib/analytics-examples.ts`, `lib/analytics-performance.ts`, `lib/analytics-privacy.ts`, `lib/mood-factory.ts`, `lib/seo/og-cache.ts`, `lib/storage.ts`, `services/audio-service.ts` (see ESLint output for line numbers)

<!--
## 2. Unused Variables
- [x] Remove or use all variables that are defined but never used.
  - Affected files: `app/about/page.tsx`, `app/challenges/ChallengeClient.tsx`, `app/leaderboard/LeaderboardClient.tsx`, `app/profile/[username]/page.tsx`, `app/rant/[id]/page.tsx`, `app/roadmap/page.tsx`, `app/settings/page.tsx`, `components/ClientLayout.tsx`, `components/Header.tsx`, `components/analytics-consent.tsx`, `components/analytics/admin-navigation.tsx`, `components/analytics/advanced-filters.tsx`, `components/analytics/analytics-insights.tsx`, `components/analytics/content-analytics.tsx`, `components/analytics/top-pages-table.tsx`, `components/analytics/user-behavior-flow.tsx`, `components/enhanced-rant-card.tsx`, `components/masonry-grid.tsx`, `components/notification-list.tsx`, `components/post-rant-modal.tsx`, `components/rant-app/RantAppProvider.tsx`, `components/rant-card.tsx`, `components/seo/og-image-preloader.tsx`, `components/ui/calendar.tsx`, `components/ui/chart.tsx`, `hooks/use-analytics.ts`, `hooks/use-notifications.ts`, `lib/__tests__/analytics-privacy.test.ts`, `lib/__tests__/self-analytics.test.ts`, `lib/analytics-cache.ts`, `lib/analytics-factory.ts`, `lib/analytics-privacy.ts`, `lib/mood-factory.ts`, `lib/self-analytics.ts`, `lib/seo/og-cache-store.ts`, `lib/seo/og-cache.ts`, `lib/seo/og-templates/about-template.tsx`, `lib/seo/og-templates/profile-template.tsx`, `services/personalization.ts`, `services/sentiment-analysis.ts`
-->

<!--
## 3. React Hook Dependency Warnings
- [x] Add all required dependencies to React hook dependency arrays.
  - Affected files: `app/bookmarks/BookmarksClient.tsx`, `app/page.tsx`, `components/ClientLayout.tsx`, `components/masonry-grid.tsx`, `components/ui/logo-icon.tsx`, `components/seo/og-image-preloader.tsx`, `hooks/use-dashboard-data.ts`, `hooks/use-og-image.ts`
-->

<!--
## 4. JSX/React Attribute and Prop Warnings
- [x] Fix invalid or unknown JSX attributes and prop types.
  - Affected files: `components/ClientLayout.tsx`, `components/ui/table.tsx`
-->

## 5. JSX Content Escaping Errors
- [ ] Escape special characters in JSX as required.
  - Affected files: `app/profile/[username]/page.tsx`, `app/trending/TrendingClient.tsx`, `components/analytics/real-time-metrics.tsx`, `lib/seo/og-templates/rant-template.tsx`, `components/ClientLayout.tsx`

## 6. Miscellaneous Linting Warnings
- [ ] Address miscellaneous warnings for best practices and code quality (e.g., prefer-const, unnecessary dependencies, complex expressions in dependency arrays).
  - Affected files: `hooks/use-filtered-rants.ts`, `hooks/use-dashboard-data.ts`, `hooks/use-og-image.ts`, `components/seo/og-image-preloader.tsx`, etc.

---

# ESLint Errors (Must Fix)

- [ ] **Unexpected any. Specify a different type** (`@typescript-eslint/no-explicit-any`)
  - Affected files: see below for line numbers
    - app/about/page.tsx: 14:54, 15:53, 57:64, 93:30
    - app/api/analytics/route.ts: 404:37, 463:25
    - app/api/og/route.ts: 338:21
    - app/page.tsx: 517:59, 630:37, 638:33
    - app/roadmap/page.tsx: 292:52, 588:68
    - components/ClientLayout.tsx: 55:20
    - global.d.ts: 5:23, 6:43
    - hooks/use-accessibility.ts: 53:58
    - hooks/use-gamification.ts: 187:87, 194:87
    - lib/__tests__/analytics-performance-load.test.ts: many lines
    - lib/__tests__/analytics-validation.test.ts: 38:77
    - lib/analytics-cache.ts: 23:43, 25:62, 80:70
    - lib/analytics-db-optimized.ts: 465:17
    - lib/analytics-db.ts: 12:50, 16:54, 628:55, 708:50, 790:50, 961:50
    - lib/analytics-examples.ts: 19:79, 38:108
    - lib/analytics-performance.ts: 520:63
    - lib/analytics-privacy.ts: 134:24
    - lib/mood-factory.ts: 14:31
    - lib/seo/og-cache.ts: 265:90
    - lib/storage.ts: 29:32
    - services/audio-service.ts: 31:72

- [ ] **Parsing error**
  - lib/analytics-db-optimized.ts: 56:44 (',' expected)
  - lib/seo/og-templates-fixed.ts: 36:8 ('>' expected)

- [ ] **JSX content escaping** (`react/no-unescaped-entities`)
  - app/profile/[username]/page.tsx: 45:38
  - app/trending/TrendingClient.tsx: 300:98, 483:104
  - components/ClientLayout.tsx: 154:92
  - components/analytics/real-time-metrics.tsx: 167:54, 167:60
  - lib/seo/og-templates/rant-template.tsx: 57:25, 81:25

- [ ] **Unknown property 'as-child' found** (`react/no-unknown-property`)
  - components/ClientLayout.tsx: 173:85, 203:85

- [ ] **'className' is missing in props validation** (`react/prop-types`)
  - components/ui/table.tsx: 72:6, 87:6

- [ ] **A `require()` style import is forbidden** (`@typescript-eslint/no-require-imports`)
  - hooks/__tests__/use-analytics.test.ts: 71:33, 195:33, 228:33, 271:33
  - tailwind.config.ts: 96:13

- [ ] **'filtered' is never reassigned. Use 'const' instead** (`prefer-const`)
  - hooks/use-filtered-rants.ts: 40:13

---

# ESLint Warnings (Should Fix)

- [ ] **Unused variables** (`@typescript-eslint/no-unused-vars`)
  - Many files, see ESLint output for details (e.g., app/challenges/ChallengeClient.tsx: 108:11, etc.)

- [ ] **React Hook dependency issues** (`react-hooks/exhaustive-deps`)
  - app/bookmarks/BookmarksClient.tsx: 69:11 (MOODS in useCallback)
  - app/page.tsx: 214:8, 224:8, 234:8, 243:8, 735:8
  - components/ClientLayout.tsx: 46:8, 43:8
  - components/masonry-grid.tsx: 39:8
  - components/seo/og-image-preloader.tsx: 27:8, 27:15
  - components/ui/logo-icon.tsx: 173:8, 53:11
  - hooks/use-dashboard-data.ts: 66:8
  - hooks/use-og-image.ts: 75:8, 75:15

- [ ] **ARIA attribute not supported by role** (`jsx-a11y/role-supports-aria-props`)
  - app/bookmarks/BookmarksClient.tsx: 414:49

- [ ] **Other warnings**
  - See ESLint output for details (e.g., prefer-const, unnecessary dependencies, etc.)

---

*This checklist is auto-updated from the latest ESLint output. Please check off each item as you address it, and keep this list in sync with future lint runs.*
