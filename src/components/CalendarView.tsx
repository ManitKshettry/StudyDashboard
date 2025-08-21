import React, { useState } from 'react';
import { useStudy } from '../contexts/StudyContext';
import { SUBJECTS } from '../types';
import { formatDate, getDaysLeft, isOverdue } from '../utils/dateUtils';
import { Plus, Edit2, Trash2, Calendar, Clock, AlertCircle, CheckSquare } from 'lucide-react';

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
        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        <option disabled value="">Hr</option>
        {hours.map(hour => (
          <option key={hour} value={hour}>{hour}</option>
        ))}
      </select>
      <select
        value={value.minutes}
        onChange={(e) => onChange({ ...value, minutes: e.target.value })}
        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        <option disabled value="">Min</option>
        {minutes.map(minute => (
          <option key={minute} value={minute}>{minute}</option>
        ))}
      </select>
      <select
        value={value.ampm}
        onChange={(e) => onChange({ ...value, ampm: e.target.value })}
        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        <option disabled value="">AM/PM</option>
        {ampmOptions.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
};

const CalendarView: React.FC = () => {
  const { calendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = useStudy();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    time: { hours: '09', minutes: '00', ampm: 'AM' },
    eventType: 'Event' as 'Event' | 'Exam',
    subject: '',
    description: '',
    location: '',
    reminderSet: false,
    preparationChecklist: [''],
  });

  const resetForm = () => {
    setFormData({
      date: '',
      time: { hours: '09', minutes: '00', ampm: 'AM' },
      eventType: 'Exam',
      subject: '',
      description: '',
      location: '',
      reminderSet: false,
      preparationChecklist: [''],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const formatTimeToString = (time: { hours: string; minutes: string; ampm: string }) => {
    if (!time.hours || !time.minutes || !time.ampm) return '09:00';
    let hours24 = parseInt(time.hours);
    if (time.ampm === 'PM' && hours24 !== 12) {
      hours24 += 12;
    } else if (time.ampm === 'AM' && hours24 === 12) {
      hours24 = 0;
    }
    return `${hours24.toString().padStart(2, '0')}:${time.minutes}`;
  };

  const parseTimeFromString = (timeString: string) => {
    if (!timeString) return { hours: '09', minutes: '00', ampm: 'AM' };
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
    const timeString = formatTimeToString(formData.time);
    const eventData = {
      ...formData,
      date: formData.date,
      time: timeString,
      preparationChecklist: formData.preparationChecklist.filter(item => item.trim() !== ''),
    };

    if (editingId) {
      updateCalendarEvent(editingId, eventData);
    } else {
      const newEvent = {
        ...eventData,
        id: Date.now().toString(),
      };
      addCalendarEvent(newEvent);
    }
    resetForm();
  };

  const handleEdit = (event: any) => {
    setFormData({
      date: event.date,
      time: parseTimeFromString(event.time),
      eventType: event.eventType,
      subject: event.subject,
      description: event.description,
      location: event.location,
      reminderSet: event.reminderSet,
      preparationChecklist: event.preparationChecklist.length > 0 ? event.preparationChecklist : [''],
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const addChecklistItem = () => {
    setFormData({
      ...formData,
      preparationChecklist: [...formData.preparationChecklist, ''],
    });
  };

  const updateChecklistItem = (index: number, value: string) => {
    const newChecklist = [...formData.preparationChecklist];
    newChecklist[index] = value;
    setFormData({ ...formData, preparationChecklist: newChecklist });
  };

  const removeChecklistItem = (index: number) => {
    setFormData({
      ...formData,
      preparationChecklist: formData.preparationChecklist.filter((_, i) => i !== index),
    });
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'Exam': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
      case 'Event': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
    }
  };

  // Filter out overdue events and sort remaining ones by date
  const upcomingEvents = calendarEvents
    .filter(event => !isOverdue(event.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar & Events</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage exams, deadlines, and important dates</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-colors duration-200">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingId ? 'Edit Event' : 'Add New Event'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                <TimePicker
                  value={formData.time}
                  onChange={(time) => setFormData({ ...formData, time })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Type</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Exam">Exam</option>
                  <option value="Event">Event</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject {formData.eventType === 'Exam' && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required={formData.eventType === 'Exam'}
                >
                  <option value="">Select Subject</option>
                  {SUBJECTS.map(subject => (
                    <option key={subject.name} value={subject.name}>{subject.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add any important details or notes"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location/Link</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Room 203 or Online Portal"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.reminderSet}
                  onChange={(e) => setFormData({ ...formData, reminderSet: e.target.checked })}
                  className="rounded"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Set Reminder</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preparation Checklist</label>
                {formData.preparationChecklist.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateChecklistItem(index, e.target.value)}
                      placeholder="Preparation item"
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    {formData.preparationChecklist.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addChecklistItem}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Add item
                </button>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingId ? 'Update' : 'Add'} Event
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h2>
          </div>
          <div className="p-6">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No upcoming events scheduled
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => {
                  const daysLeft = getDaysLeft(event.date);
                  const subjectColor = SUBJECTS.find(s => s.name === event.subject)?.color || '#6B7280';
                  return (
                    <div key={event.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded border ${getEventTypeColor(event.eventType)}`}>
                              {event.eventType}
                            </span>
                            {event.reminderSet && (
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(event)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteCalendarEvent(event.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <h3 className="font-semibold text-gray-900 dark:text-white" style={{ color: subjectColor }}>
                            {event.subject}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(event.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {event.time}
                            </span>
                            {event.location && (
                              <span>@ {event.location}</span>
                            )}
                          </div>
                          <div className={`text-sm font-medium mt-1 ${
                            daysLeft === 0 ? 'text-red-600 dark:text-red-400' : 
                            daysLeft === 1 ? 'text-orange-600 dark:text-orange-400' : 
                            'text-green-600 dark:text-green-400'
                          }`}>
                            {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days left`}
                          </div>
                          {event.preparationChecklist.length > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <CheckSquare className="h-3 w-3 inline mr-1" />
                              {event.preparationChecklist.length} items to prepare
                            </div>
                          )}
                        </div>
                      </div>
                      {event.preparationChecklist.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preparation Checklist:</p>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {event.preparationChecklist.map((item, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
