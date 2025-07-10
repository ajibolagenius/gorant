# Rant 💭 - Anonymous Mental Health Platform

A modern, anonymous platform for emotional expression and mental health support, built with Next.js, Supabase, and enhanced with gamification elements.

![Rant App Screenshot](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-07-10%20at%2009.04.02-x0X2kwvzvRBIwK0TpTWTPh1NBOXrXt.png)

## ✨ Features

### 🎭 **Anonymous Expression**
- Post anonymous rants with mood indicators
- Express emotions without judgment
- Safe space for mental health discussions

### 🎮 **Gamification System**
- Points and levels for engagement
- Achievement badges and milestones
- Weekly challenges and leaderboards
- Reputation system for community building

### 🤖 **AI-Powered Features**
- Sentiment analysis for emotional insights
- Content moderation for safety
- Personalized recommendations
- Mood tracking and analytics

### 📱 **Modern UI/UX**
- Responsive design with Tailwind CSS
- Dark/light mode support
- Masonry grid layout for optimal content display
- Phosphor Icons in duotone style for visual consistency
- Smooth animations and micro-interactions

### 🔒 **Privacy & Safety**
- Anonymous posting system
- Content moderation and reporting
- User blocking capabilities
- Privacy-first analytics

### 🌐 **Social Features**
- Comment system with threading
- Tag following and discovery
- Real-time updates
- Social sharing capabilities

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/rant-app.git
   cd rant-app
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your Supabase credentials:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   \`\`\`

4. **Set up the database**
   \`\`\`bash
   # Run the SQL scripts in order
   npm run db:setup
   \`\`\`

5. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

The application uses Supabase as the backend. Run these SQL scripts in order:

1. `scripts/01-create-tables.sql` - Creates all necessary tables
2. `scripts/02-create-functions.sql` - Sets up database functions and triggers
3. `scripts/03-seed-data.sql` - Adds initial data for testing

## 🎨 Design System

The application follows a comprehensive design system documented in `DESIGN_SYSTEM.md`:

- **Colors**: Purple-based primary palette with mood-specific colors
- **Typography**: Inter font family with semantic sizing
- **Icons**: Phosphor Icons in duotone weight for consistency
- **Components**: Reusable shadcn/ui components with custom styling
- **Spacing**: 8px grid system for consistent layouts

## 📁 Project Structure

\`\`\`
rant-app/
├── app/                    # Next.js app directory
│   ├── challenges/         # Weekly challenges page
│   ├── leaderboard/        # Community leaderboard
│   ├── settings/           # User settings
│   ├── trending/           # Trending rants
│   └── page.tsx           # Main feed page
├── components/             # Reusable components
│   ├── ui/                # shadcn/ui components
│   ├── enhanced-rant-card.tsx
│   ├── gamification-panel.tsx
│   └── app-sidebar.tsx
├── hooks/                  # Custom React hooks
├── services/              # API services
│   ├── content-moderation.ts
│   ├── sentiment-analysis.ts
│   └── personalization.ts
├── scripts/               # Database scripts
└── styles/               # Global styles
\`\`\`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:setup` - Set up database tables

## 🎯 Key Features Implementation

### Gamification System
- **Points**: Earned through posting, commenting, and receiving likes
- **Levels**: Progressive system with unlockable features
- **Badges**: Achievement system for milestones
- **Challenges**: Weekly community challenges

### Content Moderation
- **AI Moderation**: Automatic content filtering
- **Community Reporting**: User-driven content moderation
- **Reputation System**: Trust-based user scoring

### Accessibility
- **WCAG Compliance**: Full accessibility support
- **Screen Reader**: Compatible with assistive technologies
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Support for visual impairments

## 🔮 Future Enhancements

### Planned Features
- [ ] Native mobile applications (iOS/Android)
- [ ] Voice rants and audio support
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Offline capabilities
- [ ] Video rant support
- [ ] Advanced AI insights

### Potential Integrations
- [ ] Motion.js for enhanced animations
- [ ] Remotion for video content generation
- [ ] Three.js for 3D mood visualizations
- [ ] Tauri for desktop applications

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our [Wiki](https://github.com/yourusername/rant-app/wiki)
- **Issues**: Report bugs on [GitHub Issues](https://github.com/yourusername/rant-app/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/yourusername/rant-app/discussions)
- **Email**: support@rantapp.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Phosphor Icons](https://phosphoricons.com/) - Icon library
- [Vercel](https://vercel.com/) - Deployment platform

---

**Made with ❤️ for mental health awareness and community support**
\`\`\`

Now let me create the comprehensive design system document:
