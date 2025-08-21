# 📚 StudyDashboard — Your Complete Academic Management Hub

[![Netlify Status](https://api.netlify.com/api/v1/badges/85a1ee82-d902-4c97-8fef-bcab213b4750/deploy-status)](https://app.netlify.com/projects/phoebuz/deploys)

👉 **Live Site:** [Try StudyDashboard Now](https://phoebuz.netlify.app/)

StudyDashboard is a comprehensive, student-friendly academic management application built to help you stay organized and on top of your studies. With homework tracking, grade management, calendar organization, and timetable planning — StudyDashboard is your all-in-one solution for academic success.

---

## 🌟 Key Features

### 📝 Homework Tracker
* Manage assignments with due dates, priorities, and status tracking
* Never miss another deadline with smart notifications
* Track progress from "Not Started" to "Completed"

### 📊 Grades Log & Analytics
* Log all your academic performance with weighted averages
* Visual progress tracking and performance insights
* Calculate GPA and identify areas for improvement

### 📅 Calendar & Events Management
* Schedule exams, deadlines, and important academic dates
* Color-coded event types for easy organization
* Never double-book or forget important dates

### ⏰ Timetable Organizer
* Plan your weekly class schedule
* Visual weekly layout for better time management
* Easy drag-and-drop scheduling

### 🎯 Smart Dashboard
* Overview of upcoming deadlines and assignments
* Countdown widgets for important dates
* Quick stats and progress indicators

### 🔐 Secure Authentication
* Google OAuth integration for easy sign-in
* Email/password authentication options
* Secure user data isolation

---

## 🧪 Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Frontend   | Vite, React, TypeScript, TailwindCSS   |
| Backend    | Supabase (PostgreSQL, Auth, Real-time) |
| Database   | PostgreSQL with Row Level Security     |
| Icons      | Lucide React                            |
| State Mgmt | React Context + Hooks                  |
| Hosting    | Netlify                                 |

---

## ⚙️ Environment Setup

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### Supabase Setup
1. Create a project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Enable Google OAuth in Authentication > Providers
4. Set redirect URL to: `https://your-project-id.supabase.co/auth/v1/callback`
5. Run the SQL migrations in `supabase/migrations/`

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials for web application
3. Add redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
4. Add client ID and secret to Supabase project

---

## 🛠 Development Guidelines

* Modify `src/components/` for new features
* Add new utilities in `src/utils/` directory
* Style components using TailwindCSS utility classes
* Database changes go in `supabase/migrations/`
* Keep TypeScript types updated in `src/types/`

---

## 🚀 Available Scripts

```bash
npm install       # Install all dependencies
npm run dev       # Run local dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Check code for issues
```

---

## 📦 Database Schema

The app uses these core tables with Row Level Security (RLS):
- `profiles` - User profile information
- `homework` - Assignment tracking and management
- `calendar_events` - Exams and important dates
- `grades` - Academic performance records
- `timetable` - Weekly class schedules

All data is automatically isolated per user for privacy and security.

---

## 📦 Deployment

This project is auto-deployed to Netlify. Just push to the main branch to trigger a redeploy.

If you're deploying manually:

```bash
npm run build
# Then drag-and-drop the `dist/` folder to Netlify or connect your repo
```

---

## 📌 Roadmap

* [ ] Add study session timer with Pomodoro technique
* [ ] Implement file upload for assignment attachments
* [ ] Add collaborative study group features
* [ ] Create mobile app with React Native
* [ ] Add AI-powered study recommendations

---

## 🤝 Contributing

Want to help improve StudyDashboard? We'd love your contributions!

```bash
# Fork the repository
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
# Then create a pull request
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## ⚠️ Disclaimer

> **StudyDashboard is designed to help with academic organization and time management.**
> While it can improve your study habits, remember that consistent effort and proper study techniques are key to academic success.
