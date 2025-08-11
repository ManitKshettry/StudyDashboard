# Phoebuz Dashboard

A comprehensive student dashboard for managing homework, grades, calendar events, and timetables with real-time data persistence and Google OAuth integration.

## Features

- **Authentication**: Email/password and Google OAuth sign-in
- **Homework Tracker**: Manage assignments with due dates, priorities, and status tracking
- **Grades Log**: Track academic performance with weighted averages and analytics
- **Calendar & Events**: Schedule exams, deadlines, and important dates
- **Timetable**: Organize weekly class schedules
- **Dashboard**: Overview with countdown widgets and upcoming deadlines
- **Real-time Data**: All data persisted to Supabase with user isolation

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Go to Authentication > Providers and enable Google OAuth:
   - Add your Google OAuth client ID and secret
   - Set redirect URL to: `https://your-project-id.supabase.co/auth/v1/callback`
4. Run the SQL migration in the Supabase SQL editor (see `supabase/migrations/create_initial_schema.sql`)

### 2. Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `https://your-project-id.supabase.co/auth/v1/callback`
5. Add the client ID and secret to your Supabase project

### 4. Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Database Schema

The app uses the following tables:
- `profiles`: User profile information
- `homework`: Assignment tracking
- `calendar_events`: Exams and important dates
- `grades`: Academic performance records
- `timetable`: Weekly class schedules

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Authentication**: Supabase Auth with Google OAuth

## Project Structure

```
src/
├── components/          # React components
│   ├── widgets/        # Reusable widget components
│   ├── Auth.tsx        # Authentication component
│   ├── Dashboard.tsx   # Main dashboard
│   ├── HomeworkTracker.tsx
│   ├── GradesLog.tsx
│   ├── CalendarView.tsx
│   ├── Timetable.tsx
│   └── Navigation.tsx
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication state
│   └── StudyContext.tsx # App data state
├── lib/               # External service configs
│   └── supabase.ts    # Supabase client
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
│   ├── dateUtils.ts   # Date manipulation
│   └── gradeUtils.ts  # Grade calculations
└── App.tsx            # Main app component
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
