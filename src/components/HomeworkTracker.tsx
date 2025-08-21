import React, { useState } from 'react';
import { useStudy } from '../contexts/StudyContext';
import { SUBJECTS } from '../types';
import { useAuth } from '../contexts/AuthContext'; // ← ADD THIS LINE
import { getDaysLeft, isOverdue, formatDate } from '../utils/dateUtils';
import { Plus, Edit2, Trash2, ExternalLink, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

// Time dropdown component
interface TimePickerProps {
  value: { hours: string; minutes: string; ampm: string };
  onChange: (time: { hours: string; minutes: string; ampm: string }) => void;
  className?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, className = '' }) => {
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const ampmOptions = ['AM', 'PM'];

  return (
    <div className={`flex gap-2 ${className}`}>
      <select
        value={value.hours}
        onChange={(e) => onChange({ ...value, hours: e.target.value })}
        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Hr</option>
        {hours.map(hour => (
          <option key={hour} value={hour}>{hour}</option>
        ))}
      </select>
      <select
        value={value.minutes}
        onChange={(e) => onChange({ ...value, minutes: e.target.value })}
        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Min</option>
        {minutes.map(minute => (
          <option key={minute} value={minute}>{minute}</option>
        ))}
      </select>
      <select
        value={value.ampm}
        onChange={(e) => onChange({ ...value, ampm: e.target.value })}
        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">AM/PM</option>
        {ampmOptions.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
};
const HomeworkTracker: React.FC = () => {
  const { homework, addHomework, updateHomework, deleteHomework } = useStudy();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    assignment: '',
    dueDate: '',
    dueTime: { hours: '11', minutes: '59', ampm: 'PM' },
    status: 'Not Started' as const,
    priority: 'Medium' as const,
    notes: '',
    submissionLink: '',
  });

  const resetForm = () => {
    setFormData({
      subject: '',
      assignment: '',
      dueDate: '',
      dueTime: { hours: '11', minutes: '59', ampm: 'PM' },
      status: 'Not Started',
      priority: 'Medium',
      notes: '',
      submissionLink: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const formatTimeToString = (time: { hours: string; minutes: string; ampm: string }) => {
    if (!time.hours || !time.minutes || !time.ampm) return '23:59';
    
    let hours24 = parseInt(time.hours);
    if (time.ampm === 'PM' && hours24 !== 12) {
      hours24 += 12;
    } else if (time.ampm === 'AM' && hours24 === 12) {
      hours24 = 0;
    }
    
    return `${hours24.toString().padStart(2, '0')}:${time.minutes}`;
  };

  const parseTimeFromString = (timeString: string) => {
    if (!timeString) return { hours: '11', minutes: '59', ampm: 'PM' };
    
    const [hours24Str, minutes] = timeString.split(':');
    const hours24 = parseInt(hours24Str);
    
    let hours12 = hours24;
    let ampm = 'AM';
    
    if (hours24 === 0) {
      hours12 = 12;
    } else if (hours24 > 12) {
      hours12 = hours24 - 12;
      ampm = 'PM';
    } else if (hours24 === 12) {
      ampm = 'PM';
    }
    
    return {
      hours: hours12.toString().padStart(2, '0'),
      minutes: minutes || '00',
      ampm
    };
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const timeString = formatTimeToString(formData.dueTime);
    const dueDateTimeString = `${formData.dueDate}T${timeString}:00`;
    const today = new Date().toISOString().split('T')[0];
    
    if (editingId) {
      updateHomework(editingId, { 
        ...formData, 
        dueDate: dueDateTimeString,
        assignedDate: today 
      });
    } else {
      const newHomework = {
        ...formData,
        dueDate: dueDateTimeString,
        assignedDate: today,
        id: Date.now().toString(),
      };
      addHomework(newHomework);
    }
    
    resetForm();
  };

  const handleEdit = (hw: any) => {
    const hwDate = new Date(hw.dueDate);
    const dateString = hwDate.toISOString().split('T')[0];
    const timeString = hwDate.toTimeString().split(' ')[0].substring(0, 5);
    
    setFormData({
      subject: hw.subject,
      assignment: hw.assignment,
      dueDate: dateString,
      dueTime: parseTimeFromString(timeString),
      status: hw.status,
      priority: hw.priority,
      notes: hw.notes,
      submissionLink: hw.submissionLink || '',
    });
    setEditingId(hw.id);
    setShowForm(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Needs Revision': return 'bg-amber-100 text-amber-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Submitted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedHomework = homework.sort((a, b) => {
    // First sort by overdue status
    const aOverdue = isOverdue(a.dueDate);
    const bOverdue = isOverdue(b.dueDate);
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
    
    // Then by days left
    return getDaysLeft(a.dueDate) - getDaysLeft(b.dueDate);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Homework Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your assignments and track progress</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Homework
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
          {/* ... your existing form fields, update all input/select/textarea with dark: classes like above ... */}
        </div>
      )}

      {/* Homework Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Subject</th>
                {/* Repeat for other header cells */}
              </tr>
            </thead>
            <tbody>
              {sortedHomework.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No homework assignments yet. Add one to get started!
                  </td>
                </tr>
              ) : (
                sortedHomework.map((hw) => {
                  const overdue = isOverdue(hw.dueDate);
                  const subjectColor = SUBJECTS.find(s => s.name === hw.subject)?.color || '#6B7280';
                  return (
                    <tr key={hw.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subjectColor }}
                          ></div>
                          <span className="font-medium">{hw.subject}</span>
                        </div>
                      </td>
                      {/* Repeat for other cells, updating classes */}
                      <td className="px-4 py-3 text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(hw)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteHomework(hw.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          {hw.submissionLink && (
                            <a
                              href={hw.submissionLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HomeworkTracker;