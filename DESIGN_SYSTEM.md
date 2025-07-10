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

> **Note:** Colors are managed via Tailwind CSS and custom properties in `tailwind.config.ts`.

---

## 🔤 Typography

- **Font Family:** `Inter`, sans-serif (Google Fonts)
- **Font Sizes:**
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

---

## 🧩 Component Styles

### Buttons
- **Primary:** `bg-purple-600 text-white hover:bg-purple-700`
- **Secondary:** `bg-white text-purple-600 border border-purple-600 hover:bg-purple-50`
- **Outline:** `border border-gray-300 text-gray-700 hover:bg-gray-100`
- **Disabled:** `opacity-50 cursor-not-allowed`

### Cards
- **Base:** `bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4`
- **Accent:** `bg-gradient-to-r from-yellow-100 to-orange-100`

### Inputs
- **Base:** `border border-gray-200 dark:border-gray-600 rounded px-3 py-2 focus:border-purple-400`

### Badges
- **Primary:** `bg-purple-100 text-purple-800`
- **Secondary:** `bg-yellow-100 text-yellow-800`

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

---

## 🖌️ Iconography

- **Library:** [Phosphor Icons](https://phosphoricons.com/?weight=duotone)
- **Style:** Duotone
- **Usage:**
  - All navigation, sidebar, and action icons use `weight="duotone"`
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
