import React from 'react';
import { Home, BookOpen, Calendar, Trophy, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { signOut, user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'homework', label: 'Homework', icon: BookOpen },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'grades', label: 'Grades', icon: Trophy },
    { id: 'timetable', label: 'Timetable', icon: Clock },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Phoebuz Dashboard</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
            
            <div className="ml-3 pl-3 border-l border-gray-200 flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:inline">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;