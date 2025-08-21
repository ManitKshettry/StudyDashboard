import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StudyProvider } from './contexts/StudyContext';
import { ThemeProvider } from './contexts/ThemeContext';
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Initializing application...</p>
        </div>
      </div>
    );
  }

  // Show auth page if user is not authenticated
  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<Auth />} />
        </Routes>
      </Router>
    );
  }

  // Main app with navigation
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'homework':
        return <HomeworkTracker />;
      case 'calendar':
        return <CalendarView />;
      case 'grades':
        return <GradesLog />;
      case 'timetable':
        return <Timetable />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="transition-colors duration-200">
        {renderActiveTab()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StudyProvider>
          <AppContent />
        </StudyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
