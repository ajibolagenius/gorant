# Rant Application Design System

A comprehensive guide to the visual and interaction standards for the Rant platform. This document ensures consistency, scalability, and accessibility across all UI/UX touchpoints.

---

## 🎨 Color Palette

| Name         | Light Mode                | Dark Mode                 | Usage                        |
|--------------|---------------------------|---------------------------|------------------------------|
| Primary      | #a259ff                   | #a259ff                   | Buttons, highlights          |
| Secondary    | #f7b801                   | #f7b801                   | Accents, badges              |
| Background   | #faf7ff                   | #18181b                   | App background               |
| Card         | #fff                      | #23272f                   | Cards, surfaces              |
| Accent       | #ff6f61                   | #ff6f61                   | Alerts, error, mood tags     |
| Success      | #22c55e                   | #22c55e                   | Success, positive feedback   |
| Warning      | #facc15                   | #facc15                   | Warnings, caution            |
| Info         | #38bdf8                   | #38bdf8                   | Info, links                  |
| Muted        | #e5e7eb                   | #374151                   | Borders, dividers            |
| Tag Border   | #a259ff, #e5e7eb, etc.    | #a259ff, #374151, etc.    | Tag outlines (contextual)    |
| Reputation   | #facc15                   | #facc15                   | Reputation badge/tooltip     |

> **Note:** Colors are managed via Tailwind CSS and custom properties in `tailwind.config.ts`. High contrast mode uses black/white for maximum accessibility.

---

## 🔤 Typography

- **Font Family:**
  - Headings: `Space Grotesk`, sans-serif (Google Fonts)
  - Body: `Manrope`, sans-serif (Google Fonts)
  - Monospace: `JetBrains Mono`, monospace (Google Fonts, for badges, pills, and code)
- **Font Sizes:**
  - `text-xs` (0.75rem/12px) – tags, pills, badges
  - `text-sm` (0.875rem/14px) – UI, buttons, search
  - `text-base` (1rem/16px) – body (default)
  - `text-lg` (1.125rem/18px) – section headings
  - `text-xl` (1.25rem/20px) – main headings
  - `text-2xl` (1.5rem/24px) – page titles
- **Font Weights:**
  - Regular: 400
  - Bold: 700
- **Line Height:**
  - Default: 1.5
- **Accessibility:**
  - Font sizes cascade globally via `<body>` class
  - High contrast mode available
  - Screen reader mode with enhanced compatibility

> **Note:** Space Grotesk provides modern, geometric headings. Manrope offers excellent readability for body text. JetBrains Mono ensures clarity for badges and pills. All fonts are loaded via Google Fonts in `app/globals.css`.

---

## 🧩 Component Styles

### Buttons
- **Primary:** `bg-purple-600 text-white hover:bg-purple-700`
- **Secondary:** `bg-white text-purple-600 border border-purple-600 hover:bg-purple-50`
- **Outline:** `border border-gray-300 text-gray-700 hover:bg-gray-100`
- **Ghost:** `bg-transparent text-gray-500 hover:text-purple-600`
- **Destructive:** `bg-destructive text-destructive-foreground hover:bg-destructive/90`
- **Disabled:** `opacity-50 cursor-not-allowed`
- **Mobile Filter/Clear:** `flex-1 w-full` (side-by-side on mobile)
- **Shape:** Sharp corners (no border-radius)

### Cards
- **Base:** `bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0`
- **Hover:** `hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`
- **Shape:** Sharp corners (no border-radius)

### Inputs
- **Base:** `border border-input bg-background px-3 py-2 focus:border-purple-400`
- **Search:** `pl-10` for icon, push-down suggestions panel below input
- **Shape:** Sharp corners (no border-radius)

### Badges & Pills
- **Tag:** `text-xs px-2 py-0.5 border font-medium` (border color matches tag context)
- **Pill (Mood, Trending, Sentiment, Verified):** `text-xs px-2 py-0.5 font-medium` (smaller, subtle)
- **Reputation:** `inline-flex items-center text-yellow-700 dark:text-yellow-300` with tooltip modal `border-yellow-400`
- **Font:** JetBrains Mono for all badges and pills
- **Shape:** Sharp corners (no border-radius)

### Mood Pills & Badges
- Mood icons are always duotone and colored according to their mood
- Pills and badges use the mood color for both background and icon
- Color-coded by emotion (blue for sad, yellow for happy, red for angry, etc.)

### Rant of the Day
- No likes or comments UI is shown on the Rant of the Day card—only the mood icon, title, and content

---

## 🖼️ UI Patterns

- **Navigation:**
  - Desktop: Top bar with nav links and icons
  - Mobile: Bottom nav bar (icon-only), floating action button (FAB), slide-in sidebar
- **Sidebar:**
  - Desktop: Sticky/fixed, collapsible
  - Mobile: Slide-in drawer, accessible via FAB, scrollable content
- **Grid:**
  - Masonry layout, responsive columns (1 on mobile, 2 on tablet, 3+ on desktop)
- **Modals:**
  - Centered, with overlay, accessible close icon
- **Toasts:**
  - Top-right, with close icon, color-coded for type
- **Search:**
  - Suggestions panel pushes content down (not floating)
  - Suggestions show full string (no ellipsis)
- **Filters:**
  - Filter and Clear buttons are full-width and side-by-side on mobile
  - Active filter count badge on Filter button
  - Clear button resets all filters/search
- **Responsive Design:**
  - All elements wrap and adapt to screen size
  - `wrap-screen` utility prevents horizontal overflow
  - `mb-safe-bottom` adds safe area margin on mobile

---

## 🖌️ Iconography

- **Library:** [Phosphor Icons](https://phosphoricons.com/?weight=duotone) and [Lucide Icons](https://lucide.dev/)
- **Style:** Duotone for moods and actions, consistent with mood color
- **Usage:**
  - All navigation, sidebar, and action icons use `weight="duotone"`
  - Mood icons are always duotone and colored according to their mood (e.g., blue for sad, yellow for happy, etc.)
  - Close actions use the `X` icon, filter actions use the `Filter` icon, and clear actions use the `Eraser` icon for clarity
  - Neutral: `text-gray-500 dark:text-gray-300`
  - Active: `text-purple-600 dark:text-purple-400`
  - Hover: `hover:text-purple-600 dark:hover:text-purple-400`
- **Size:**
  - Small: `w-4 h-4`
  - Medium: `w-6 h-6`
  - Large: `w-8 h-8`

---

## ♿ Accessibility Guidelines

### Visual Accessibility
- **Contrast:** All text and icons meet WCAG AA contrast ratios
- **High Contrast Mode:** Black/white theme available via settings
- **Focus:** Visible focus ring on all interactive elements (`focus:ring-2 focus:ring-purple-400`)
- **Font Size:** Adjustable via settings (Small, Normal, Large, Extra Large)

### Interaction Accessibility
- **Keyboard Navigation:** All components are keyboard accessible
- **ARIA Labels:** Used for icons/buttons without visible text
- **Touch Targets:** Minimum 44x44px for all buttons and nav items
- **Screen Reader:** Enhanced compatibility mode available

### Motion & Audio
- **Reduced Motion:** Respects `prefers-reduced-motion` and user settings
- **Audio Feedback:** Mood-based sounds and action sounds with volume control
- **Animation Duration:** 200–300ms for micro-interactions
- **Smooth Scrolling:** Lenis integration with reduced motion support

### Content Accessibility
- **Screen Reader Mode:** Enhanced compatibility with screen readers
- **Semantic HTML:** Proper heading hierarchy and landmark roles
- **Alt Text:** All images have descriptive alt text
- **Color Independence:** Information not conveyed by color alone

---

## 🔊 Audio System

### Audio Feedback
- **Mood-based Sounds:** Different tones for each mood when posting
- **Action Sounds:** Distinct sounds for likes, achievements, and posts
- **Volume Control:** Adjustable volume (0-100%) with mute option
- **Settings Persistence:** Audio preferences saved automatically

### Audio Implementation
- **Web Audio API:** Uses native browser audio capabilities
- **Frequency Mapping:** Each mood and action has specific frequencies
- **Graceful Degradation:** Audio disabled if not supported
- **User Interaction:** Audio context initialized on first user interaction

---

## 🔔 Notification System

### Notification Types
- **Likes:** When someone likes your rant
- **Comments:** When someone comments on your rant
- **Mentions:** When someone mentions you
- **Challenges:** New challenge notifications
- **Achievements:** Unlocked achievement notifications

### Notification Features
- **Global State:** Zustand-based state management
- **Persistence:** Notifications saved to localStorage
- **Badge Count:** Unread notification count in header
- **Test Functionality:** Test notifications available in settings
- **Visual Design:** Consistent with overall UI design

---

## ⚙️ Settings & Privacy

### Accessibility Settings
- **Font Size:** Small, Normal, Large, Extra Large
- **Contrast:** Normal, High Contrast
- **Screen Reader Mode:** Enhanced compatibility toggle
- **Reduced Motion:** Minimize animations toggle

### Audio Settings
- **Audio Feedback:** Enable/disable toggle
- **Volume Control:** Slider (0-100%)
- **Test Sound:** Button to test audio functionality

### Notification Settings
- **Push Notifications:** Enable/disable toggle
- **Achievement Alerts:** Notification toggle
- **Challenge Updates:** Notification toggle
- **Test Notifications:** Send sample notifications

### Privacy Settings
- **Private Account:** Only approved followers can see content
- **Hide from Search:** Prevent profile from search results
- **Allow Mentions:** Control mention permissions

### Content Filters
- **Hide Sensitive Content:** Blur/hide NSFW content
- **Filter Negative Language:** Reduce toxic content exposure
- **Blocked Keywords/Tags:** Custom keyword filtering

---

## 🛠️ Technical Implementation

### Tailwind & Customization
- **Tailwind CSS:** All utility classes and rapid prototyping
- **CSS Variables:** Custom properties in `tailwind.config.ts` for theming
- **Component Variants:** Class variance authority for component variants
- **Sharp Corners:** `--radius: 0px` for consistent square design

### State Management
- **Zustand:** Lightweight state management for notifications and settings
- **localStorage:** Persistent storage for user preferences
- **React Hooks:** Custom hooks for accessibility, settings, and notifications

### Performance
- **Virtualization:** React-window for large lists
- **Lazy Loading:** Dynamic imports for heavy components
- **Smooth Scrolling:** Lenis integration for premium feel
- **Optimized Animations:** Framer Motion with reduced motion support

---

## 📦 Example Usage

```tsx
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star } from "phosphor-react"

// Button with sharp corners
<Button className="bg-purple-600 text-white hover:bg-purple-700">
  <Star weight="duotone" className="w-4 h-4 mr-2 text-yellow-500" />
  Bookmark
</Button>

// Badge with JetBrains Mono font
<Badge className="text-xs px-2 py-0.5 border font-medium">
  Trending
</Badge>

// Card with backdrop blur
<Card className="shadow-sm border-0 bg-card/80 dark:bg-card/80 backdrop-blur">
  <CardContent className="pt-6">
    Content here
  </CardContent>
</Card>
```

---

## 📚 Resources
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Phosphor Icons](https://phosphoricons.com/?weight=duotone)
- [Lucide Icons](https://lucide.dev/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [Space Grotesk Font](https://fonts.google.com/specimen/Space+Grotesk)
- [Manrope Font](https://fonts.google.com/specimen/Manrope)
- [JetBrains Mono Font](https://fonts.google.com/specimen/JetBrains+Mono)

---

> **Keep this document updated as your design evolves!**
