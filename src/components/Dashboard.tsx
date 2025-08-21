import React from 'react';
import { useStudy } from '../contexts/StudyContext';
import { getNextUpcoming, getDaysLeft, isOverdue } from '../utils/dateUtils';
import { calculateWeightedAverage } from '../utils/gradeUtils';
import { useAuth } from '../contexts/AuthContext';
import CountdownWidget from './widgets/CountdownWidget';
import StatsWidget from './widgets/StatsWidget';
import { BookOpen, Calendar, Trophy, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { homework, calendarEvents, grades, loading, error } = useStudy();
  const { user } = useAuth();

  // Show loading state if data is still loading
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading your study data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-300" />
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get active homework and events
  const activeHomework = homework.filter(hw => !['Completed', 'Submitted'].includes(hw.status));
  const upcomingEvents = calendarEvents.filter(event => !isOverdue(event.date));
  
  // Calculate stats
  const overallAverage = calculateWeightedAverage(grades);
  const overdueHomework = homework.filter(hw => isOverdue(hw.dueDate) && !['Completed', 'Submitted'].includes(hw.status));
  
  // Get next upcoming items (homework and events combined)
  const upcomingItems = [
    ...activeHomework.map(hw => ({
      ...hw,
      displayTitle: hw.assignment,
      displayDescription: hw.subject,
      displayDate: hw.dueDate,
      type: 'homework'
    })),
    ...upcomingEvents.map(event => ({
      ...event,
      displayTitle: event.subject || event.eventType,
      displayDescription: event.description,
      displayDate: event.date,
      type: 'event'
    }))
  ].sort((a, b) => new Date(a.displayDate).getTime() - new Date(b.displayDate).getTime());

  const nextSevenDays = upcomingItems.filter(item => {
    const daysLeft = getDaysLeft(item.displayDate);
    return daysLeft >= 0 && daysLeft <= 7;
  }).slice(0, 5);

  // Check if user has no data
  const hasData = homework.length > 0 || calendarEvents.length > 0 || grades.length > 0;

  if (!hasData) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No data yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Start by adding some homework, events, or grades to see your dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back! Here's your academic progress overview.
          </p>
        </div>

        {/* Stats Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsWidget
            title="Active Homework"
            value={activeHomework.length}
            icon={BookOpen}
            color="blue"
            subtitle={`${overdueHomework.length} overdue`}
          />
          <StatsWidget
            title="Upcoming Events"
            value={upcomingEvents.length}
            icon={Calendar}
            color="green"
            subtitle="Next 30 days"
          />
          <StatsWidget
            title="Overall Average"
            value={overallAverage > 0 ? `${overallAverage}%` : 'N/A'}
            icon={Trophy}
            color="yellow"
            subtitle={`Based on ${grades.length} grades`}
          />
          <StatsWidget
            title="This Week"
            value={nextSevenDays.length}
            icon={Clock}
            color="purple"
            subtitle="Due items"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Deadlines */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Next 7 days</p>
            </div>
            <div className="p-6">
              {nextSevenDays.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">All caught up!</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    No pending homework<br/>
                    No exams scheduled<br/>
                    Enjoy the break!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {nextSevenDays.map((item, index) => {
                    const daysLeft = getDaysLeft(item.displayDate);
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.displayTitle}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.displayDescription}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            daysLeft === 0 ? 'text-red-600 dark:text-red-400' : 
                            daysLeft === 1 ? 'text-orange-600 dark:text-orange-400' : 
                            'text-gray-900 dark:text-white'
                          }`}>
                            {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(item.displayDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Countdown Widget */}
          <CountdownWidget />
        </div>

        {/* Additional Message */}
        {nextSevenDays.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No upcoming deadlines in the next 7 days
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
