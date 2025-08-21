// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StudyProvider } from './contexts/StudyContext';

import Auth from './components/Auth';
import AuthCallback from './components/AuthCallback';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import HomeworkTracker from './components/HomeworkTracker';
import CalendarView from './components/CalendarView';
import GradesLog from './components/GradesLog';
import Timetable from './components/Timetable';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Loader while checking session
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  if (!user && window.location.pathname !== '/auth/callback') {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="p-6">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'homework' && <HomeworkTracker />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'grades' && <GradesLog />}
        {activeTab === 'timetable' && <Timetable />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <StudyProvider>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </StudyProvider>
      </AuthProvider>
    </Router>
  );
}
