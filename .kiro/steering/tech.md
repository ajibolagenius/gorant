# Technology Stack

## Framework & Runtime
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Node.js** runtime environment

## UI & Styling
- **Tailwind CSS** for styling with custom design system
- **shadcn/ui** component library built on Radix UI primitives
- **Phosphor Icons** (duotone style preferred)
- **Framer Motion** for animations
- **GSAP** for advanced animations
- **Lenis** for smooth scrolling

## State Management & Data
- **Zustand** for global state management
- **React Hook Form** with Zod validation
- **Supabase** for backend (database, auth, real-time)
- **Local Storage** for client-side persistence

## Key Libraries
- **class-variance-authority (CVA)** for component variants
- **clsx** + **tailwind-merge** for conditional styling
- **date-fns** for date manipulation
- **react-window** for virtualization
- **canvas-confetti** for celebrations
- **howler** for audio feedback

## Development Tools
- **TypeScript** for type safety
- **ESLint** for code quality (build errors ignored in config)
- **PostCSS** + **Autoprefixer** for CSS processing

## Common Commands
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Package management
npm install          # Install dependencies
npm update           # Update dependencies
```

## Build Configuration
- Images are unoptimized (`unoptimized: true`)
- TypeScript and ESLint errors ignored during builds
- Tailwind configured for all JS/TS/JSX/TSX files in app/, components/, and root
