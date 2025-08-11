// src/App.tsx
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StudyProvider } from './contexts/StudyContext';

import Auth from './components/Auth';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import HomeworkTracker from './components/HomeworkTracker';
import CalendarView from './components/CalendarView';
import GradesLog from './components/GradesLog';
// ✅ Removed: import Timetable from './components/Timetable';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Loader while checking session
  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'homework' && <HomeworkTracker />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'grades' && <GradesLog />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StudyProvider>
        <AppContent />
      </StudyProvider>
    </AuthProvider>
  );
}
