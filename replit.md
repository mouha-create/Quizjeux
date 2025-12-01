# QuizCraft AI - Interactive Quiz Generator SaaS

## Overview
QuizCraft AI is a full-featured quiz generator SaaS application that allows users to create, play, and share interactive quizzes. It features AI-powered question generation, gamification, beautiful themes, and comprehensive analytics.

## Current State
**Status:** MVP Complete and Functional

### Implemented Features (MVP)
- **AI Quiz Generation:** Create 10-20 questions from any topic using OpenAI GPT-5
- **4 Question Types:** Multiple choice, true/false, short text, and ranking
- **5 Customizable Themes:** Purple, green, orange, pink, blue with gradient backgrounds
- **Interactive Quiz Player:** Timer, animations, confetti effects, immediate feedback
- **Real-time Scoring:** Streak tracking, points, accuracy calculation
- **Results Dashboard:** Performance charts, accuracy, time analytics
- **Gamification:** XP points, levels, 8 achievement badges, leaderboard
- **Quiz Library:** Create, edit, duplicate, delete, share quizzes
- **Responsive Design:** Works on desktop and mobile with Framer Motion animations
- **Share via Links:** Unique quiz URLs for sharing

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS + Shadcn UI components
- Framer Motion for animations
- Recharts for analytics visualization
- Wouter for routing
- TanStack Query for data fetching

### Backend
- Express.js with TypeScript
- In-memory storage (MemStorage)
- OpenAI API integration for AI generation
- Zod for validation

## Project Structure

```
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── ui/         # Shadcn components
│   │   │   ├── navbar.tsx  # Navigation bar
│   │   │   └── theme-toggle.tsx
│   │   ├── pages/          # Route pages
│   │   │   ├── home.tsx    # Landing page with hero
│   │   │   ├── library.tsx # Quiz library/management
│   │   │   ├── create.tsx  # Quiz creator with AI
│   │   │   ├── edit.tsx    # Quiz editor
│   │   │   ├── play.tsx    # Quiz player
│   │   │   ├── stats.tsx   # User statistics
│   │   │   └── leaderboard.tsx
│   │   ├── lib/            # Utilities
│   │   │   ├── quiz-themes.ts  # Theme configurations
│   │   │   ├── confetti.ts     # Celebration effects
│   │   │   ├── queryClient.ts  # API client
│   │   │   └── utils.ts
│   │   ├── App.tsx         # Main app with routing
│   │   └── index.css       # Global styles
│   └── index.html
├── server/                  # Backend Express application
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route handlers
│   ├── storage.ts          # In-memory data storage
│   ├── openai.ts           # AI question generation
│   └── vite.ts             # Vite dev server integration
├── shared/                  # Shared code
│   └── schema.ts           # TypeScript types & Zod schemas
└── design_guidelines.md     # UI/UX design specifications
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/quizzes | List all quizzes |
| GET | /api/quizzes/:id | Get single quiz |
| POST | /api/quizzes | Create new quiz |
| PATCH | /api/quizzes/:id | Update quiz |
| DELETE | /api/quizzes/:id | Delete quiz |
| POST | /api/quizzes/:id/duplicate | Duplicate quiz |
| POST | /api/quizzes/generate | AI generate questions |
| POST | /api/quizzes/submit | Submit quiz answers |
| GET | /api/results | Get quiz results history |
| GET | /api/stats | Get user statistics |
| GET | /api/leaderboard | Get leaderboard |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| OPENAI_API_KEY | For AI features | OpenAI API key for question generation |
| SESSION_SECRET | Yes | Session encryption secret |

## Running the Application

The application runs on port 5000 with the command:
```bash
npm run dev
```

This starts both the Express backend and Vite frontend server.

## Gamification System

### Badges
- **First Steps:** Complete your first quiz
- **Perfect!:** Get 100% on a quiz
- **On Fire:** Get 5 correct answers in a row
- **Unstoppable:** Get 10 correct answers in a row
- **Quiz Master:** Complete 10 quizzes
- **Speedster:** Complete a quiz in under 2 minutes
- **Creator:** Create your first quiz
- **Brainiac:** Answer 100 questions correctly

### Leveling
- XP earned = quiz score
- Level up threshold = level * 1000 XP

## Recent Changes
- 2025-11-29: Authentication system fixed and database fully integrated
  - Express-session configuration added with secure cookie handling
  - Database schema migration complete with PostgreSQL + Drizzle ORM
  - User authentication routes working: signup, login, logout, /me
  - Quiz API fully functional with database persistence
  - All 404 errors resolved
  - Tables created: users, quizzes, results, userStats

- 2024-11-29: Initial MVP implementation complete
  - Full quiz CRUD operations
  - AI question generation with OpenAI
  - Interactive quiz player with timer and feedback
  - Gamification with badges, XP, levels
  - Statistics and leaderboard
  - 5 color themes
  - Sample quizzes for demo

## Next Phase Features (Planned)
- Multi-user authentication and workspaces
- Advanced analytics dashboard
- Stripe monetization (Free/Pro/Business tiers)
- Lead generation features
- Educational features (learning mode, certificates)
- Premium templates library
- PDF/document import for auto-generation
- Custom CSS and white-label options

## Design System
See `design_guidelines.md` for complete UI/UX specifications including:
- Typography (Inter primary, Poppins headings)
- Color themes and gradients
- Component patterns
- Animation guidelines
- Responsive breakpoints
