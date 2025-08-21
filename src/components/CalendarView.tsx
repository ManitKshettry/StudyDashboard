import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useStudy } from '../contexts/StudyContext';
import { SUBJECTS } from '../types';
import { formatDate, getDaysLeft, isOverdue } from '../utils/dateUtils';
import { Plus, Edit2, Trash2, Calendar, Clock, AlertCircle, CheckSquare } from 'lucide-react';

const CalendarView: React.FC = () => {
  const { calendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = useStudy();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date(),
    time: new Date(),
    eventType: 'Event' as 'Event' | 'Exam',
    subject: '',
    description: '',
    location: '',
    reminderSet: false,
    preparationChecklist: [''],
  });

  const resetForm = () => {
    setFormData({
      date: new Date(),
      time: new Date(),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dateString = formData.date.toISOString().split('T')[0];
    const timeString = formData.time.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const eventData = {
      ...formData,
      date: dateString,
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
      date: new Date(event.date),
      time: event.time ? new Date(`2000-01-01T${event.time}:00`) : new Date(),
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
      case 'Exam': return 'bg-red-100 text-red-800 border-red-200';
      case 'Event': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter out overdue events and sort remaining ones by date
  const upcomingEvents = calendarEvents
    .filter(event => !isOverdue(event.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar & Events</h1>
          <p className="text-gray-600 mt-1">Manage exams, deadlines, and important dates</p>
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
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Event' : 'Add New Event'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <DatePicker
                  selected={formData.date}
                  onChange={(date) => setFormData({ ...formData, date: date || new Date() })}
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select event date"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  minDate={new Date()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <DatePicker
                  selected={formData.time}
                  onChange={(time) => setFormData({ ...formData, time: time || new Date() })}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select time"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Exam">Exam</option>
                  <option value="Event">Event</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject {formData.eventType === 'Exam' && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={formData.eventType === 'Exam'}
                >
                  <option value="">Select Subject</option>
                  {SUBJECTS.map(subject => (
                    <option key={subject.name} value={subject.name}>{subject.name}</option>
                  ))}
                </select>
              </div>
                            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add any important details or notes"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location/Link</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Room 203 or Online Portal"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reminderSet"
                checked={formData.reminderSet}
                onChange={(e) => setFormData({ ...formData, reminderSet: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="reminderSet" className="text-sm font-medium text-gray-700">
                Set Reminder
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preparation Checklist</label>
              <div className="space-y-2">
                {formData.preparationChecklist.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateChecklistItem(index, e.target.value)}
                      placeholder="Preparation item"
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add item
                </button>
              </div>
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
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
        </div>
        
        {upcomingEvents.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No upcoming events scheduled</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcomingEvents.map((event) => {
              const daysLeft = getDaysLeft(event.date);
              const subjectColor = SUBJECTS.find(s => s.name === event.subject)?.color || '#6B7280';
              
              return (
                <div key={event.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: subjectColor }}
                      ></div>
                      <span className={`px-2 py-1 rounded border text-xs font-medium ${getEventTypeColor(event.eventType)}`}>
                        {event.eventType}
                      </span>
                      {event.reminderSet && (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex gap-1">
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
                  
                  <div className="mb-2">
                    <h3 className="font-semibold text-lg">{event.subject}</h3>
                    <p className="text-gray-700">{event.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{event.time}</span>
                    </div>
                    {event.location && (
                      <span>@ {event.location}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className={`text-sm font-medium ${
                      daysLeft <= 1 ? 'text-red-600' : 
                      daysLeft <= 3 ? 'text-amber-600' : 
                      'text-blue-600'
                    }`}>
                      {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days left`}
                    </div>
                    
                    {event.preparationChecklist.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <CheckSquare className="h-3 w-3" />
                        <span>{event.preparationChecklist.length} items to prepare</span>
                      </div>
                    )}
                  </div>
                  
                  {event.preparationChecklist.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-700 mb-2">Preparation Checklist:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {event.preparationChecklist.map((item, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
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

  {/* Past Events removed as requested */}
    </div>
  );
};

export default CalendarView;