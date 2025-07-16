---
inclusion: always
---

# Technology Stack & Development Guidelines

## Core Stack
- **Next.js 14** App Router with **React 18** and **TypeScript**
- **Tailwind CSS** + **shadcn/ui** components (Radix UI primitives)
- **Zustand** for state, **Supabase** for backend, **Local Storage** for persistence
- **Phosphor Icons** (duotone preferred), **Framer Motion** + **GSAP** for animations

## Required Libraries & Usage
- **CVA** for component variants, **clsx** + **tailwind-merge** for conditional styling
- **React Hook Form** + **Zod** for forms, **react-window** for virtualization
- **canvas-confetti** for celebrations, **howler** for audio feedback
- **date-fns** for dates, **Lenis** for smooth scrolling

## Code Style Rules
- Use **TypeScript** strictly - no `any` types
- **PascalCase** for components, **kebab-case** for UI files, **camelCase** for utilities
- Prefer custom hooks over prop drilling
- Separate client/server components clearly
- Use compound component patterns for complex UI

## Performance Requirements
- Implement virtualization for lists >50 items
- Lazy load non-critical components
- Debounce search/filtering (300ms minimum)
- Use React.memo for expensive renders

## Build Configuration Notes
- Images unoptimized (`unoptimized: true`)
- TypeScript/ESLint errors ignored during builds
- Tailwind scans: `app/`, `components/`, root files

## Development Commands
```bash
npm run dev    # Development server
npm run build  # Production build
npm run lint   # Code quality check
```
