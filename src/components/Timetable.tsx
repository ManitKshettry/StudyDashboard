import React, { useState } from 'react';
import { useStudy } from '../contexts/StudyContext';
import { SUBJECTS } from '../types';
import { Edit2, Save, X, Clock, MapPin, User } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const TIME_SLOTS = [
  '8:00-8:45', '8:45-9:30', '9:30-10:15', '10:15-11:00',
  '11:15-12:00', '12:00-12:45', '1:30-2:15', '2:15-3:00'
];

const Timetable: React.FC = () => {
  const { timetable, updateTimetable } = useStudy();
  const [editingCell, setEditingCell] = useState<{ day: string; period: number } | null>(null);
  const [editData, setEditData] = useState({
    subject: '',
    teacher: '',
    room: '',
    startTime: '',
    endTime: '',
  });

  const getTimetableEntry = (day: string, period: number) => {
    return timetable.find(entry => entry.day === day && entry.period === period);
  };

  const handleEdit = (day: string, period: number) => {
    const entry = getTimetableEntry(day, period);
    if (entry) {
      setEditData({
        subject: entry.subject,
        teacher: entry.teacher,
        room: entry.room,
        startTime: entry.startTime,
        endTime: entry.endTime,
      });
    } else {
      setEditData({
        subject: '',
        teacher: '',
        room: '',
        startTime: TIME_SLOTS[period - 1] || '',
        endTime: '',
      });
    }
    setEditingCell({ day, period });
  };

  const handleSave = async () => {
    if (!editingCell) return;
    
    const { day, period } = editingCell;
    
    // If all fields are empty, delete the entry
    if (!editData.subject && !editData.teacher && !editData.room) {
      await updateTimetable(day, period, null);
    } else {
      await updateTimetable(day, period, editData);
    }
    
    setEditingCell(null);
  };

  const handleCancel = () => {
    setEditingCell(null);
    setEditData({
      subject: '',
      teacher: '',
      room: '',
      startTime: '',
      endTime: '',
    });
  };

  const getSubjectColor = (subject: string) => {
    const subjectData = SUBJECTS.find(s => s.name === subject);
    return subjectData?.color || '#6B7280';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Timetable</h1>
        <p className="text-gray-600 mt-1">Manage your weekly class schedule</p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">How to use:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click on any cell to edit class details</li>
          <li>• Leave all fields empty and save to remove a class</li>
          <li>• Use the subject dropdown or type a custom subject</li>
        </ul>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-24">Period</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-32">Time</th>
                {DAYS.map(day => (
                  <th key={day} className="px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-48">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {PERIODS.map(period => (
                <tr key={period} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {period}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {TIME_SLOTS[period - 1]}
                  </td>
                  {DAYS.map(day => {
                    const entry = getTimetableEntry(day, period);
                    const isEditing = editingCell?.day === day && editingCell?.period === period;
                    
                    return (
                      <td key={`${day}-${period}`} className="px-4 py-3">
                        {isEditing ? (
                          <div className="space-y-2 min-w-48">
                            <select
                              value={editData.subject}
                              onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                              className="w-full p-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select Subject</option>
                              {SUBJECTS.map(subject => (
                                <option key={subject.name} value={subject.name}>
                                  {subject.name}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={editData.teacher}
                              onChange={(e) => setEditData({ ...editData, teacher: e.target.value })}
                              placeholder="Teacher"
                              className="w-full p-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={editData.room}
                              onChange={(e) => setEditData({ ...editData, room: e.target.value })}
                              placeholder="Room"
                              className="w-full p-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={handleSave}
                                className="flex-1 bg-green-600 text-white p-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                              >
                                <Save className="h-3 w-3" />
                                Save
                              </button>
                              <button
                                onClick={handleCancel}
                                className="flex-1 bg-gray-300 text-gray-700 p-1 rounded text-xs hover:bg-gray-400 transition-colors flex items-center justify-center gap-1"
                              >
                                <X className="h-3 w-3" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleEdit(day, period)}
                            className="min-h-16 p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-300"
                          >
                            {entry ? (
                              <div className="space-y-1">
                                <div
                                  className="text-xs font-semibold px-2 py-1 rounded text-white"
                                  style={{ backgroundColor: getSubjectColor(entry.subject) }}
                                >
                                  {entry.subject}
                                </div>
                                {entry.teacher && (
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <User className="h-3 w-3" />
                                    <span>{entry.teacher}</span>
                                  </div>
                                )}
                                {entry.room && (
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <MapPin className="h-3 w-3" />
                                    <span>{entry.room}</span>
                                  </div>
                                )}
                                {(entry.startTime || entry.endTime) && (
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <Clock className="h-3 w-3" />
                                    <span>{entry.startTime || TIME_SLOTS[period - 1]}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-16 text-gray-400 text-xs">
                                <Edit2 className="h-4 w-4 mb-1" />
                                <span className="ml-1">Click to add</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-3">Subject Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {SUBJECTS.map(subject => (
            <div key={subject.name} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: subject.color }}
              ></div>
              <span className="text-sm text-gray-700">{subject.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timetable;