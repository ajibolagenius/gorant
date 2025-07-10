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

> **Note:** Colors are managed via Tailwind CSS and custom properties in `tailwind.config.ts`.

---

## 🔤 Typography

- **Font Family:**
  - Headings: `Montserrat`, sans-serif (Google Fonts)
  - Body: `Lora`, serif (Google Fonts)
  - Pills/Buttons: `JetBrains Mono`, monospace (Google Fonts, recommended for clarity and modern look)
- **Font Sizes:**
  - `text-xs` (0.75rem/12px) – tags, pills, badges
  - `text-sm` (0.875rem/14px) – UI, buttons, search
  - `text-base` (1rem/16px) – body
  - `text-lg` (1.125rem/18px) – section headings
  - `text-xl` (1.25rem/20px) – main headings
  - `text-2xl` (1.5rem/24px) – page titles
- **Font Weights:**
  - Regular: 400
  - Medium: 500
  - Bold: 700
- **Line Height:**
  - Default: 1.5

> **Note:** Montserrat is used for all headings for a modern, clean look. Lora is used for body text for warmth and readability. Both are loaded via Google Fonts in `app/globals.css`.

---

## 🧩 Component Styles

### Buttons
- **Primary:** `bg-purple-600 text-white hover:bg-purple-700`
- **Secondary:** `bg-white text-purple-600 border border-purple-600 hover:bg-purple-50`
- **Outline:** `border border-gray-300 text-gray-700 hover:bg-gray-100`
- **Ghost:** `bg-transparent text-gray-500 hover:text-purple-600`
- **Disabled:** `opacity-50 cursor-not-allowed`
- **Mobile Filter/Clear:** `flex-1 w-full` (side-by-side on mobile)

### Cards
- **Base:** `bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4`
- **Accent:** `bg-gradient-to-r from-yellow-100 to-orange-100`

### Inputs
- **Base:** `border border-gray-200 dark:border-gray-600 rounded px-3 py-2 focus:border-purple-400`
- **Search:** `pl-10` for icon, push-down suggestions panel below input

### Badges & Pills
- **Tag:** `text-xs px-2 py-0.5 border font-medium rounded` (border color matches tag context)
- **Pill (Mood, Trending, Sentiment, Verified):** `text-xs px-2 py-0.5 font-medium` (smaller, subtle)
- **Reputation:** `inline-flex items-center text-yellow-700 dark:text-yellow-300` with tooltip modal `border-yellow-400`

### Mood Pills & Badges
- Mood icons are always duotone and colored according to their mood
- Pills and badges use the mood color for both background and icon

### Rant of the Day
- No likes or comments UI is shown on the Rant of the Day card—only the mood icon, title, and content

---

## 🖼️ UI Patterns

- **Navigation:**
  - Desktop: Top bar with nav links and icons
  - Mobile: Bottom nav bar, floating action button (FAB), slide-in sidebar
- **Sidebar:**
  - Desktop: Sticky/fixed, collapsible
  - Mobile: Slide-in drawer, accessible via FAB
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

- **Contrast:** All text and icons meet WCAG AA contrast ratios.
- **Focus:** Visible focus ring on all interactive elements (`focus:ring-2 focus:ring-purple-400`).
- **Keyboard Navigation:** All components are keyboard accessible.
- **ARIA Labels:** Used for icons/buttons without visible text.
- **Motion:** Respects `prefers-reduced-motion` for animations.
- **Touch Targets:** Minimum 44x44px for all buttons and nav items.
- **Screen Reader:** Search, filter, and action buttons have descriptive labels.

---

## 🛠️ Tailwind & Customization

- **Tailwind CSS** is used for all utility classes and rapid prototyping.
- **Custom properties** in `tailwind.config.ts` allow for easy theming and color changes.
- **Component overrides** are handled via className props and Tailwind’s `@apply` directive in CSS if needed.

---

## 📦 Example Usage

```tsx
import { Button } from "@/components/ui/button"
import { Star } from "phosphor-react"

<Button className="bg-purple-600 text-white hover:bg-purple-700">
  <Star weight="duotone" className="w-4 h-4 mr-2 text-yellow-500" />
  Bookmark
</Button>
```

---

## 📚 Resources
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Phosphor Icons](https://phosphoricons.com/?weight=duotone)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

> **Keep this document updated as your design evolves!**
