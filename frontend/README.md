# 🧠 PersonalMind - AI Second Brain

> A beautiful, modern frontend for your personal AI memory + productivity system

PersonalMind is an intelligent personal knowledge management system that combines **PARA**, **GTD**, and **Zettelkasten** methodologies with AI to create your ultimate second brain.

## ✨ Features

### 🎯 Core Pages

- **Dashboard** - Your command center with quick actions, stats, and AI suggestions
- **BrainChat** - Conversational AI interface to query your knowledge base
- **Knowledge Base** - PARA-organized document management (Projects, Areas, Resources, Archives)
- **Knowledge Graph** - Visual network of connected ideas and documents
- **Tasks** - GTD-based task management with smart categorization
- **AI Insights** - Personalized reflections, patterns, and suggestions
- **Profile** - Progress tracking and focus area management

### 🚀 Unique Features

- **Focus Mode** - Pomodoro-style timer with beautiful UI
- **Quick Actions** - One-click access to common tasks
- **Dark/Light Mode** - Seamless theme switching
- **Smart Suggestions** - AI-powered recommendations on dashboard
- **Real-time Stats** - Live tracking of your productivity
- **Animated UI** - Smooth, delightful micro-interactions
- **Glass Morphism** - Modern, elegant design system
- **Responsive Design** - Works beautifully on all devices

### 🎨 Design Highlights

- Custom gradient system with primary/accent colors
- Glass-card components with backdrop blur
- Smooth animations using Framer Motion
- Hover effects and micro-interactions
- Clean, minimal interface
- Accessibility-first approach

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible components
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching & caching

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── chat/          # Chat-related components
│   ├── knowledge/     # Document management
│   ├── layout/        # App layout & sidebar
│   ├── tasks/         # Task components
│   ├── ui/            # Reusable UI components
│   ├── FocusMode.tsx  # Focus timer modal
│   └── theme-provider.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── BrainChat.tsx
│   ├── Knowledge.tsx
│   ├── KnowledgeGraph.tsx
│   ├── Tasks.tsx
│   ├── Insights.tsx
│   └── Profile.tsx
├── lib/
│   ├── api.ts         # API client & types
│   └── utils.ts       # Utility functions
└── hooks/             # Custom React hooks
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#0EA5E9) - Main brand color
- **Accent**: Cyan (#06B6D4) - Secondary highlights
- **Success**: Green (#10B981) - Positive actions
- **Warning**: Orange (#F59E0B) - Alerts
- **Destructive**: Red (#EF4444) - Errors

### Components
- Glass cards with backdrop blur
- Gradient buttons and accents
- Smooth hover effects
- Animated page transitions
- Loading states with skeletons

## 🔌 API Integration

Currently using mock data. Replace `src/lib/api.ts` functions with real FastAPI endpoints:

```typescript
// Example: Replace mock with real API
export const api = {
  getDashboard: async () => {
    const response = await fetch('/api/dashboard');
    return response.json();
  },
  // ... other endpoints
};
```

## 📱 Pages Overview

### Dashboard
- Personalized greeting based on time of day
- Quick action buttons for common tasks
- Stats overview (documents, tasks, deadlines, topics)
- Recent activity feed
- AI-powered suggestions
- Focus Mode launcher

### BrainChat
- Conversational AI interface
- Source citation panel
- Suggested questions
- Typing indicators
- Message history

### Knowledge Base
- PARA methodology tabs
- Document upload with drag & drop
- Search and filter
- Document preview modal
- Category management

### Knowledge Graph
- Visual node network
- Filter by type (topic/document/task)
- Connection statistics
- Interactive nodes

### Tasks
- GTD categories (Today, Upcoming, Overdue, Done)
- Task statistics
- Quick toggle completion
- Linked documents

### AI Insights
- Weekly reflections
- Pattern detection
- Achievement tracking
- Personalized suggestions

### Profile
- User information
- Focus areas
- Progress tracking
- Statistics visualization

## 🎯 Future Enhancements

- [ ] Real-time collaboration
- [ ] Mobile app
- [ ] Voice input for BrainChat
- [ ] Advanced graph visualization (D3.js)
- [ ] Export/import functionality
- [ ] Calendar integration
- [ ] Email integration
- [ ] GitHub integration
- [ ] Custom themes
- [ ] Keyboard shortcuts

## 🏗️ Architecture

PersonalMind follows a clean architecture:

1. **Presentation Layer** (React Components)
2. **Business Logic** (Custom Hooks)
3. **Data Layer** (API Client)
4. **State Management** (TanStack Query)

## 📄 License

MIT License - feel free to use this project for your own second brain!

---

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

Built with ❤️ for knowledge workers, students, and lifelong learners
