# Rant - Anonymous Expression Platform

A modern, anonymous social platform where users can express their thoughts, frustrations, and emotions in a safe, supportive environment. Built with Next.js 14, TypeScript, and Supabase.

## ✨ Features

### 🎭 **Anonymous Expression**
- Post rants without revealing your identity using friendly anonymous names
- Express emotions through 12 distinct mood categories (sad, crying, happy, neutral, angry, heartbroken, love, anxious, confused, tired, excited, confident)
- Safe space for authentic self-expression with content moderation
- Sentiment analysis for better content understanding

### 🎮 **Gamification System**
- User levels and experience points for engagement
- Achievement badges and milestone tracking
- Interactive leaderboards with privacy controls
- Weekly challenges and community goals
- Audio feedback and confetti celebrations
- Reputation system based on community contributions

### 🏷️ **Smart Organization**
- Tag-based categorization with follow/unfollow functionality
- Advanced mood-based filtering with visual indicators
- Trending topics and "Rant of the Day" features
- Smart search with auto-suggestions
- Personalized content recommendations
- Multiple sorting options (latest, popular, most liked, recommended)

### 💬 **Community Interaction**
- Like and comment system with real-time updates
- Bookmark favorite content for later viewing
- Share rants with native sharing API support
- Block users and report inappropriate content
- Real-time engagement tracking and notifications

### 🎨 **Modern UI/UX**
- Responsive design with mobile-first approach
- Dark/light theme support with system preference detection
- Masonry grid layout for optimal content display
- Smooth animations with Framer Motion and GSAP
- Lenis smooth scrolling for enhanced UX
- Phosphor Icons in duotone style throughout
- Accessibility-first design with screen reader support
- Customizable font sizes and contrast settings

### 🔧 **Technical Features**
- Server-side rendering with Next.js 14 App Router
- Real-time updates with Supabase integration
- Virtualized scrolling for performance with large datasets
- Progressive Web App (PWA) capabilities
- Comprehensive keyboard shortcuts support
- Local storage for offline functionality
- Advanced content moderation and filtering
- Self-hosted analytics system with privacy controls and admin dashboard

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0 or later
- **npm** or **yarn** package manager
- **Supabase** account (optional for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ajibolagenius/gorant.git
   cd rant-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup** (Optional)
   ```bash
   cp .env.example .env.local
   ```

   Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
node test-analytics.js  # Test analytics database functionality
```

## 🏗️ Tech Stack

### Core Framework
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with TypeScript
- **TypeScript** - Type-safe JavaScript

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library built on Radix UI
- **Phosphor Icons** - Icon system (duotone style)
- **Framer Motion** - Animation library
- **GSAP** - Advanced animations
- **Lenis** - Smooth scrolling

### State & Data Management
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling with Zod validation
- **Supabase** - Backend as a Service (database, auth, real-time)
- **Local Storage** - Client-side data persistence

### Key Libraries
- **class-variance-authority** - Component variant management
- **clsx + tailwind-merge** - Conditional styling utilities
- **date-fns** - Date manipulation
- **react-window** - Virtualization for performance
- **canvas-confetti** - Celebration animations
- **howler** - Audio feedback system

## 📱 Usage

### Basic Navigation
- **Home Feed** - Browse all rants with filtering options
- **Trending** - Discover popular and trending content
- **Challenges** - Participate in community challenges
- **Leaderboard** - View top contributors and your ranking
- **Bookmarks** - Access your saved rants

### Posting a Rant
1. Click the "Post Rant" button or use keyboard shortcut `N`
2. Select your current mood from 12 available options
3. Write your thoughts (10-1000 characters)
4. Add relevant tags for better discoverability
5. Submit and earn experience points

### Keyboard Shortcuts
- `N` - Create new rant
- `J/K` - Navigate between rants
- `L` - Like selected rant
- `B` - Bookmark selected rant
- `/` - Focus search
- `?` - Show all shortcuts
- `Esc` - Close modals

### Customization
- **Themes** - Switch between light and dark modes
- **Accessibility** - Adjust font size and contrast
- **Notifications** - Configure engagement alerts
- **Privacy** - Control leaderboard visibility and analytics

## 🏛️ Architecture

### Project Structure
```
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main feed page
│   ├── admin/analytics/   # Analytics dashboard
│   └── [feature]/         # Feature-based routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── analytics/        # Analytics dashboard components
│   └── [feature].tsx     # Feature components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and analytics
├── services/             # Business logic services
├── data/                 # Static data and docs
├── scripts/              # Database and setup scripts
└── test-analytics.js     # Analytics testing utility
```

### Key Design Patterns
- **Server/Client Components** - Optimal performance with Next.js 14
- **Custom Hooks** - Reusable state logic
- **Service Layer** - Separated business logic
- **Component Composition** - Flexible and maintainable UI
- **Type Safety** - Full TypeScript coverage

## 🔒 Privacy & Safety

### Content Moderation
- Automated content filtering for inappropriate material
- Community reporting system
- Sentiment analysis for content understanding
- Reputation-based moderation scoring

### User Privacy
- Complete anonymity with friendly generated names
- No personal data collection
- Optional analytics participation
- Local data storage with user control

### Safety Features
- User blocking capabilities
- Content reporting mechanisms
- Configurable content filters
- Safe space community guidelines

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Workflow**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Phosphor Icons](https://phosphoricons.com/) for the icon system
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Vercel](https://vercel.com/) for hosting and deployment

## 📞 Support

If you have any questions or need help, please:


- Search existing [Issues](https://github.com/ajibolagenius/gorant/issues)
- Create a new issue if needed

---

**Made with ❤️ by the Rant community**
