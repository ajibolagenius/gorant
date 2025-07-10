# Rant App Design System

A comprehensive guide to the visual and interaction design principles of the Rant application.

## 🎨 Color Palette

### Primary Colors
\`\`\`css
/* Purple - Primary Brand Color */
--purple-50: #faf5ff
--purple-100: #f3e8ff
--purple-200: #e9d5ff
--purple-300: #d8b4fe
--purple-400: #c084fc
--purple-500: #a855f7  /* Primary */
--purple-600: #9333ea
--purple-700: #7c3aed
--purple-800: #6b21a8
--purple-900: #581c87
\`\`\`

### Mood Colors
\`\`\`css
/* Happy/Excited */
--mood-happy: #fbbf24    /* Yellow-400 */
--mood-happy-bg: #fef3c7 /* Yellow-100 */

/* Sad/Down */
--mood-sad: #3b82f6      /* Blue-500 */
--mood-sad-bg: #dbeafe   /* Blue-100 */

/* Angry/Frustrated */
--mood-angry: #ef4444    /* Red-500 */
--mood-angry-bg: #fee2e2 /* Red-100 */

/* Anxious/Worried */
--mood-anxious: #f97316  /* Orange-500 */
--mood-anxious-bg: #fed7aa /* Orange-100 */

/* Calm/Peaceful */
--mood-calm: #10b981     /* Emerald-500 */
--mood-calm-bg: #d1fae5  /* Emerald-100 */

/* Confused/Mixed */
--mood-confused: #8b5cf6 /* Violet-500 */
--mood-confused-bg: #ede9fe /* Violet-100 */
\`\`\`

### Semantic Colors
\`\`\`css
/* Success */
--success: #10b981
--success-bg: #d1fae5

/* Warning */
--warning: #f59e0b
--warning-bg: #fef3c7

/* Error */
--error: #ef4444
--error-bg: #fee2e2

/* Info */
--info: #3b82f6
--info-bg: #dbeafe
\`\`\`

### Neutral Colors
\`\`\`css
/* Light Mode */
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db
--gray-400: #9ca3af
--gray-500: #6b7280
--gray-600: #4b5563
--gray-700: #374151
--gray-800: #1f2937
--gray-900: #111827

/* Dark Mode */
--dark-bg: #0f0f23
--dark-surface: #1a1a2e
--dark-border: #16213e
--dark-text: #e2e8f0
--dark-text-muted: #94a3b8
\`\`\`

## 📝 Typography

### Font Family
\`\`\`css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
\`\`\`

### Font Sizes & Line Heights
\`\`\`css
/* Headings */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }    /* 36px/40px */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }  /* 30px/36px */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }       /* 24px/32px */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }    /* 20px/28px */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }   /* 18px/28px */

/* Body Text */
.text-base { font-size: 1rem; line-height: 1.5rem; }      /* 16px/24px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }   /* 14px/20px */
.text-xs {
