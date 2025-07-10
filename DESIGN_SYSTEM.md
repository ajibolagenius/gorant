# Rant Design System

A comprehensive design system for the Rant anonymous venting platform, ensuring consistency, accessibility, and scalability across all components and features.

## 🎨 Color Palette

### **Primary Colors**
\`\`\`css
/* Light Mode */
--primary: 222.2 84% 4.9%        /* #0f172a - Deep slate */
--primary-foreground: 210 40% 98% /* #f8fafc - Light slate */

/* Dark Mode */  
--primary: 210 40% 98%           /* #f8fafc - Light slate */
--primary-foreground: 222.2 84% 4.9% /* #0f172a - Deep slate */
\`\`\`

### **Mood-Based Colors**
\`\`\`css
/* Angry - Red spectrum */
--mood-angry: 0 84% 60%          /* #ef4444 */
--mood-angry-bg: 0 93% 94%       /* #fef2f2 */
--mood-angry-border: 0 86% 86%   /* #fecaca */

/* Frustrated - Orange spectrum */
--mood-frustrated: 25 95% 53%    /* #f97316 */
--mood-frustrated-bg: 33 100% 96% /* #fff7ed */
--mood-frustrated-border: 31 91% 84% /* #fed7aa */

/* Sad - Blue spectrum */
--mood-sad: 221 83% 53%          /* #3b82f6 */
--mood-sad-bg: 214 100% 97%      /* #eff6ff */
--mood-sad-border: 213 94% 85%   /* #bfdbfe */

/* Confused - Purple spectrum */
--mood-confused: 262 83% 58%     /* #8b5cf6 */
--mood-confused-bg: 270 100% 98% /* #faf5ff */
--mood-confused-border: 266 91% 83% /* #d8b4fe */

/* Excited - Yellow spectrum */
--mood-excited: 45 93% 47%       /* #eab308 */
--mood-excited-bg: 55 92% 95%    /* #fefce8 */
--mood-excited-border: 52 98% 77% /* #fde047 */

/* Happy - Green spectrum */
--mood-happy: 142 76% 36%        /* #16a34a */
--mood-happy-bg: 138 76% 97%     /* #f0fdf4 */
--mood-happy-border: 141 84% 79% /* #86efac */
\`\`\`

### **Semantic Colors**
\`\`\`css
/* Success */
--success: 142 76% 36%           /* #16a34a */
--success-foreground: 138 76% 97% /* #f0fdf4 */

/* Warning */
--warning: 45 93% 47%            /* #eab308 */
--warning-foreground: 55 92% 95% /* #fefce8 */

/* Error */
--error: 0 84% 60%               /* #ef4444 */
--error-foreground: 0 93% 94%    /* #fef2f2 */

/* Info */
--info: 221 83% 53%              /* #3b82f6 */
--info-foreground: 214 100% 97%  /* #eff6ff */
\`\`\`

## 🔤 Typography

### **Font Family**
\`\`\`css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
\`\`\`

### **Font Scale**
\`\`\`css
/* Headings */
--text-xs: 0.75rem    /* 12px */
--text-sm: 0.875rem   /* 14px */
--text-base: 1rem     /* 16px */
--text-lg: 1.125rem   /* 18px */
--text-xl: 1.25rem    /* 20px */
--text-2xl: 1.5rem    /* 24px */
--text-3xl: 1.875rem  /* 30px */
--text-4xl: 2.25rem   /* 36px */

/* Line Heights */
--leading-tight: 1.25
--leading-normal: 1.5
--leading-relaxed: 1.625
\`\`\`

### **Font Weights**
\`\`\`css
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
\`\`\`

## 🧩 Component Guidelines

### **Cards**
\`\`\`tsx
// Standard rant card
<Card className="hover:shadow-md transition-all duration-200 hover:border-primary/20">
  <CardHeader className="pb-3">
    {/* Author info and timestamp */}
  </CardHeader>
  <CardContent className="pt-0">
    {/* Rant content and tags */}
  </CardContent>
  <CardFooter className="pt-3">
    {/* Actions: like, comment, share, bookmark */}
  </CardFooter>
</Card>
\`\`\`

### **Buttons**
\`\`\`tsx
// Primary action button
<Button className="bg-primary hover:bg-primary/90">
  Post Rant
</Button>

// Secondary action button  
<Button variant="outline">
  Cancel
</Button>

// Icon button
<Button variant="ghost" size="sm">
  <Heart size={16} weight="duotone" />
</Button>
\`\`\`

### **Badges**
\`\`\`tsx
// Mood badge
<Badge className={cn("text-xs", moodColors[mood])}>
  {moodEmojis[mood]} {mood}
</Badge>

// Tag badge
<Badge variant="secondary" className="hover:bg-primary/10 cursor-pointer">
  #{tag}
</Badge>

// Level badge
<Badge variant="outline" className="text-xs">
  Level {level}
</Badge>
\`\`\`

## 🎭 Icons

### **Phosphor Icons Configuration**
\`\`\`tsx
import { Heart, ChatCircle, Share } from '@phosphor-icons/react'

// Standard usage with duotone weight
<Heart size={16} weight="duotone" />

// Filled state for active/selected
<Heart size={16} weight="fill" className="text-red-500" />

// Icon sizes
size={12} // Small icons (badges, inline)
size={16} // Standard icons (buttons, cards)  
size={20} // Medium icons (headers)
size={24} // Large icons (main actions)
\`\`\`

### **Icon Categories**
\`\`\`tsx
// Navigation
House, TrendingUp, Trophy, Target, Gear

// Actions  
Heart, ChatCircle, Share, Bookmark, Plus

// UI Elements
X, ChevronDown, Search, Filter, Menu

// Mood Indicators
Smiley, SmileyMeh, SmileySad, SmileyAngry
\`\`\`

## 📱 Responsive Design

### **Breakpoints**
\`\`\`css
/* Mobile First Approach */
sm: '640px'   /* Small devices */
md: '768px'   /* Medium devices */  
lg: '1024px'  /* Large devices */
xl: '1280px'  /* Extra large devices */
2xl: '1536px' /* 2X large devices */
\`\`\`

### **Grid System**
\`\`\`tsx
// Mobile: Single column
// Tablet: 2 columns  
// Desktop: 3-4 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Content */}
</div>

// Sidebar layout
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <aside className="lg:col-span-1">{/* Sidebar */}</aside>
  <main className="lg:col-span-3">{/* Main content */}</main>
</div>
\`\`\`

## 🎬 Animations

### **Transition Classes**
\`\`\`css
/* Standard transitions */
.transition-all { transition: all 0.2s ease-in-out; }
.transition-colors { transition: color 0.2s ease-in-out; }
.transition-transform { transition: transform 0.2s ease-in-out; }

/* Hover effects */
.hover\:scale-105:hover { transform: scale(1.05); }
.hover\:shadow-md:hover { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
\`\`\`

### **Animation Principles**
- **Duration**: 200ms for micro-interactions, 300ms for larger changes
- **Easing**: `ease-in-out` for most transitions
- **Hover States**: Subtle scale (1.05) and shadow changes
- **Loading States**: Skeleton animations and spinners

## ♿ Accessibility

### **Color Contrast**
- **AA Standard**: Minimum 4.5:1 ratio for normal text
- **AAA Standard**: 7:1 ratio for enhanced accessibility
- **Large Text**: 3:1 ratio minimum for 18px+ or 14px+ bold

### **Focus States**
\`\`\`css
/* Focus ring for interactive elements */
.focus\:ring-2:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--primary);
}
\`\`\`

### **Screen Reader Support**
\`\`\`tsx
// Hidden text for screen readers
<span className="sr-only">Like this rant</span>

// ARIA labels
<button aria-label="Share rant" aria-pressed={isShared}>
  <Share size={16} weight="duotone" />
</button>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
\`\`\`

## 🌙 Dark Mode

### **Theme Toggle**
\`\`\`tsx
import { useTheme } from 'next-themes'

const { theme, setTheme } = useTheme()

<Button 
  variant="ghost" 
  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
>
  {theme === 'dark' ? <Sun /> : <Moon />}
</Button>
\`\`\`

### **Dark Mode Colors**
\`\`\`css
.dark {
  --background: 222.2 84% 4.9%     /* #0f172a */
  --foreground: 210 40% 98%        /* #f8fafc */
  --card: 222.2 84% 4.9%           /* #0f172a */
  --card-foreground: 210 40% 98%   /* #f8fafc */
  --border: 217.2 32.6% 17.5%      /* #1e293b */
  --muted: 217.2 32.6% 17.5%       /* #1e293b */
  --muted-foreground: 215 20.2% 65.1% /* #94a3b8 */
}
\`\`\`

## 📐 Spacing System

### **Spacing Scale**
\`\`\`css
/* Based on 4px base unit */
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
\`\`\`

### **Component Spacing**
\`\`\`tsx
// Card padding
<Card className="p-4 md:p-6">

// Section margins  
<section className="mb-8 md:mb-12">

// Button spacing
<div className="flex gap-2 md:gap-4">
\`\`\`

## 🎯 Usage Examples

### **Rant Card Implementation**
\`\`\`tsx
<Card className="group hover:shadow-md transition-all duration-200 hover:border-primary/20">
  <CardHeader className="pb-3">
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={author.avatar || "/placeholder.svg"} />
        <AvatarFallback>{author.username[0]}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium text-sm">{author.username}</span>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(timestamp)}
        </span>
      </div>
    </div>
    <Badge className={cn("text-xs", moodColors[mood])}>
      {moodEmojis[mood]} {mood}
    </Badge>
  </CardHeader>
  
  <CardContent className="pt-0">
    <p className="text-sm leading-relaxed">{content}</p>
    <div className="flex flex-wrap gap-1 mt-3">
      {tags.map(tag => (
        <Badge key={tag} variant="secondary" className="text-xs">
          #{tag}
        </Badge>
      ))}
    </div>
  </CardContent>
  
  <CardFooter className="pt-3">
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5">
          <Heart size={16} weight="duotone" />
          <span className="text-xs">{likes}</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5">
          <ChatCircle size={16} weight="duotone" />
          <span className="text-xs">{comments}</span>
        </Button>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Bookmark size={16} weight="duotone" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Share size={16} weight="duotone" />
        </Button>
      </div>
    </div>
  </CardFooter>
</Card>
\`\`\`

This design system ensures consistency, accessibility, and maintainability across the entire Rant application while providing flexibility for future enhancements and customizations.
\`\`\`
