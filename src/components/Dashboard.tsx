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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your study data...</p>
        </div>
      </div>
    );
  }

  // Show error state if data loading failed
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!homework || !calendarEvents || !grades) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600">Start by adding some homework, events, or grades to see your dashboard.</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const overdueHomework = homework.filter(hw => isOverdue(hw.dueDate));
  const upcomingHomework = homework.filter(hw => !isOverdue(hw.dueDate) && hw.status !== 'Completed' && hw.status !== 'Submitted');
  const completedHomework = homework.filter(hw => hw.status === 'Completed' || hw.status === 'Submitted');
  
  const nextHomework = upcomingHomework.length > 0 ? upcomingHomework[0] : null;
  const nextExam = calendarEvents
    .filter(event => event.eventType === 'Exam' && !isOverdue(event.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] || null;
  
  const overallAverage = calculateWeightedAverage(grades);
  
  const upcomingDeadlines = upcomingHomework
    .map(item => ({
      ...item,
      displayDate: item.dueDate,
      displayTitle: item.subject,
      displayDescription: item.assignment,
      type: 'homework' as const
    }))
    .filter(item => getDaysLeft(item.displayDate) <= 7 && !isOverdue(item.displayDate))
    .sort((a, b) => getDaysLeft(a.displayDate) - getDaysLeft(b.displayDate))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Phoebuz Study Dashboard</h1>
        <p className="text-blue-100">
          Welcome back! Here's your academic progress overview.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsWidget
          title="Overdue Tasks"
          value={overdueHomework.length}
          description={overdueHomework.length === 0 ? "Great job!" : "Needs attention"}
          type={overdueHomework.length === 0 ? 'success' : 'danger'}
        />
        <StatsWidget
          title="Pending Homework"
          value={upcomingHomework.length}
          description="Active assignments"
          type={upcomingHomework.length <= 3 ? 'success' : 'warning'}
        />
        <StatsWidget
          title="Completed Tasks"
          value={completedHomework.length}
          description="This semester"
          type="success"
        />
        <StatsWidget
          title="Overall Average"
          value={`${overallAverage}%`}
          description="Weighted GPA"
          type={overallAverage >= 80 ? 'success' : overallAverage >= 70 ? 'warning' : 'danger'}
        />
      </div>

      {/* Countdown Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Homework */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Next Deadline</h2>
          </div>
          {nextHomework ? (
            <CountdownWidget
              title={nextHomework.subject}
              dueDate={nextHomework.dueDate}
              description={nextHomework.assignment}
              type="homework"
            />
          ) : (
            <div className="p-8 text-center bg-green-50 rounded-lg border-2 border-green-200">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-green-800 font-medium">All caught up!</p>
              <p className="text-green-600 text-sm">No pending homework</p>
            </div>
          )}
        </div>

        {/* Next Exam */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold">Next Exam</h2>
          </div>
          {nextExam ? (
            <CountdownWidget
              title={nextExam.subject}
              dueDate={nextExam.date}
              description={nextExam.description}
              type="exam"
            />
          ) : (
            <div className="p-8 text-center bg-blue-50 rounded-lg border-2 border-blue-200">
              <Trophy className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <p className="text-blue-800 font-medium">No exams scheduled</p>
              <p className="text-blue-600 text-sm">Enjoy the break!</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-amber-600" />
          <h2 className="text-xl font-semibold">Upcoming Deadlines (Next 7 Days)</h2>
        </div>
        
        {upcomingDeadlines.length > 0 ? (
          <div className="space-y-3">
            {upcomingDeadlines.map((item, index) => {
              const daysLeft = getDaysLeft(item.displayDate);
              const isHomework = 'assignment' in item;
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      daysLeft <= 1 ? 'bg-red-500' : 
                      daysLeft <= 3 ? 'bg-amber-500' : 
                      'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="font-medium">{item.displayTitle}</p>
                      <p className="text-sm text-gray-600">
                        {item.displayDescription}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      daysLeft <= 1 ? 'text-red-600' : 
                      daysLeft <= 3 ? 'text-amber-600' : 
                      'text-blue-600'
                    }`}>
                      {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.displayDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No upcoming deadlines in the next 7 days</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;