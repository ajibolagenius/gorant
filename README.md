# Rant - Anonymous Venting Platform

A modern, anonymous social platform where users can express their thoughts, frustrations, and emotions in a safe, supportive environment. Built with Next.js 14, TypeScript, and Supabase.

## ✨ Features

### 🎭 **Anonymous Expression**
- Post rants without revealing your identity
- Express emotions through mood-based categorization
- Safe space for authentic self-expression

### 🎮 **Gamification System**
- User levels and experience points
- Achievement badges and milestones
- Leaderboards and challenges
- Engagement rewards

### 🏷️ **Smart Organization**
- Tag-based categorization
- Mood-based filtering (angry, frustrated, sad, confused, excited, happy)
- Trending topics and popular content
- Advanced search and filtering

### 💬 **Community Interaction**
- Like and comment on rants
- Bookmark favorite content
- Share rants with others
- Real-time engagement tracking

### 🎨 **Modern UI/UX**
- Responsive design with mobile-first approach
- Dark/light theme support
- Masonry grid layout for optimal content display
- Smooth animations and micro-interactions
- Phosphor Icons in duotone style

### 🔧 **Technical Features**
- Server-side rendering with Next.js 14
- Real-time updates with Supabase
- Infinite scroll for seamless browsing
- Progressive Web App (PWA) capabilities
- Accessibility-first design (WCAG compliant)

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
   # or
   yarn install
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
   # Run the SQL scripts in order:
   # 1. scripts/01-create-tables.sql
   # 2. scripts/02-create-functions.sql  
   # 3. scripts/03-seed-data.sql
   \`\`\`

5. **Start the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

\`\`\`
rant-app/
├── app/                    # Next.js 14 App Router
│   ├── (routes)/          # Route groups
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── rant-card.tsx     # Rant display component
│   ├── post-rant-modal.tsx
│   └── ...
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── services/             # API and external services
├── scripts/              # Database scripts
├── styles/               # Additional styles
└── types/                # TypeScript type definitions
\`\`\`

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Phosphor Icons** - Beautiful icon library
- **Framer Motion** - Animation library

### **Backend & Database**
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relational database
- **Row Level Security** - Data protection

### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **TypeScript** - Static type checking

## 🎯 Roadmap

### **Phase 1: Core Features** ✅
- [x] Basic rant posting and viewing
- [x] Mood-based categorization
- [x] Tag system
- [x] Like and comment functionality
- [x] Responsive design

### **Phase 2: Enhanced UX** 🚧
- [ ] Motion.js animations
- [ ] Swiper for mobile browsing
- [ ] Simple Analytics integration
- [ ] Advanced filtering options
- [ ] User preferences

### **Phase 3: Community Features** 📋
- [ ] User following system
- [ ] Notification system
- [ ] Content moderation tools
- [ ] Reporting system
- [ ] Community guidelines

### **Phase 4: Advanced Features** 🔮
- [ ] AI-powered content suggestions
- [ ] Sentiment analysis
- [ ] Multi-language support
- [ ] Video rant support
- [ ] Mobile app (React Native)

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

1. Check the [FAQ](docs/FAQ.md)
2. Search existing [Issues](https://github.com/yourusername/rant-app/issues)
3. Create a new issue if needed
4. Join our [Discord community](https://discord.gg/rant-app)

---

**Made with ❤️ by the Rant community**
\`\`\`
