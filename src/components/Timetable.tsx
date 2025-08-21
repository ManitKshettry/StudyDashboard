import React, { useState } from 'react';
import { useStudy } from '../contexts/StudyContext';
import { SUBJECTS } from '../types';
import { Edit2, Save, X, Clock, MapPin, User } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const TIME_SLOTS = [
  '8:00-8:45',
  '8:45-9:30',
  '9:30-10:15',
  '10:15-11:00',
  '11:15-12:00',
  '12:00-12:45',
  '1:30-2:15',
  '2:15-3:00'
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
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Timetable</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your weekly class schedule</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto transition-colors duration-200">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                {DAYS.map(day => (
                  <th key={day} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {PERIODS.map(period => (
                <tr key={period}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {period}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {TIME_SLOTS[period - 1]}
                  </td>
                  {DAYS.map(day => {
                    const entry = getTimetableEntry(day, period);
                    const isEditing = editingCell?.day === day && editingCell?.period === period;

                    return (
                      <td key={day} className="px-4 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <div className="space-y-1">
                            <select
                              value={editData.subject}
                              onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                              className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="">Subject</option>
                              {SUBJECTS.map(subject => (
                                <option key={subject.name} value={subject.name}>{subject.name}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={editData.teacher}
                              onChange={(e) => setEditData({ ...editData, teacher: e.target.value })}
                              placeholder="Teacher"
                              className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            />
                            <input
                              type="text"
                              value={editData.room}
                              onChange={(e) => setEditData({ ...editData, room: e.target.value })}
                              placeholder="Room"
                              className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={handleSave}
                                className="flex-1 p-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              >
                                <Save className="h-3 w-3 mx-auto" />
                              </button>
                              <button
                                onClick={handleCancel}
                                className="flex-1 p-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                              >
                                <X className="h-3 w-3 mx-auto" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleEdit(day, period)}
                            className="min-h-16 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                          >
                            {entry ? (
                              <div className="text-xs">
                                <div
                                  className="font-medium mb-1 text-gray-900 dark:text-white"
                                  style={{ color: getSubjectColor(entry.subject) }}
                                >
                                  {entry.subject}
                                </div>
                                {entry.teacher && (
                                  <div className="flex items-center text-gray-500 dark:text-gray-400 mb-1">
                                    <User className="h-3 w-3 mr-1" />
                                    {entry.teacher}
                                  </div>
                                )}
                                {entry.room && (
                                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {entry.room}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400 dark:text-gray-600 flex items-center justify-center h-16">
                                <Edit2 className="h-4 w-4" />
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
    </div>
  );
};

export default Timetable;
