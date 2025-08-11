import React, { useState, useEffect } from 'react';
import { useStudy } from '../contexts/StudyContext';
import { SUBJECTS, TIME_SLOTS, DAYS } from '../types';
import { Edit2, Save, X } from 'lucide-react';

const Timetable: React.FC = () => {
  const { timetable, updateTimetable } = useStudy();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<{ [key: string]: { subject: string; notes: string } }>({});

  // Initialize edit data when timetable changes
  useEffect(() => {
    const data: { [key: string]: { subject: string; notes: string } } = {};
    DAYS.forEach(day => {
      TIME_SLOTS.forEach(time => {
        const key = `${day}-${time}`;
        const slot = timetable.find(t => t.day === day && t.time === time);
        data[key] = {
          subject: slot?.subject || '',
          notes: slot?.notes || '',
        };
      });
    });
    setEditData(data);
  }, [timetable]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const newTimetable = Object.entries(editData)
      .filter(([_, value]) => value.subject.trim() !== '')
      .map(([key, value]) => {
        const [day, time] = key.split('-');
        return {
          day,
          time,
          subject: value.subject,
          notes: value.notes,
        };
      });
    
    updateTimetable(newTimetable);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset edit data to current timetable
    const data: { [key: string]: { subject: string; notes: string } } = {};
    DAYS.forEach(day => {
      TIME_SLOTS.forEach(time => {
        const key = `${day}-${time}`;
        const slot = timetable.find(t => t.day === day && t.time === time);
        data[key] = {
          subject: slot?.subject || '',
          notes: slot?.notes || '',
        };
      });
    });
    setEditData(data);
    setIsEditing(false);
  };

  const updateSlot = (day: string, time: string, field: 'subject' | 'notes', value: string) => {
    const key = `${day}-${time}`;
    setEditData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const getSlotData = (day: string, time: string) => {
    if (isEditing) {
      const key = `${day}-${time}`;
      return editData[key] || { subject: '', notes: '' };
    }
    return timetable.find(t => t.day === day && t.time === time) || { subject: '', notes: '' };
  };

  const getSubjectColor = (subject: string) => {
    if (!subject) return '#F3F4F6';
    const subjectData = SUBJECTS.find(s => s.name === subject);
    return subjectData?.color || '#6B7280';
  };

  const isLunchTime = (time: string) => time === '2:00-2:30';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weekly Timetable</h1>
          <p className="text-gray-600 mt-1">Your class schedule and notes</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit Timetable
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Subject Colors</h3>
        <div className="flex flex-wrap gap-3">
          {SUBJECTS.map(subject => (
            <div key={subject.name} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: subject.color }}
              ></div>
              <span className="text-sm text-gray-700">{subject.name}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200"></div>
            <span className="text-sm text-gray-700">Lunch</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200"></div>
            <span className="text-sm text-gray-700">Free Period</span>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 min-w-[100px]">
                  Time
                </th>
                {DAYS.map(day => (
                  <th key={day} className="px-3 py-3 text-center text-sm font-medium text-gray-700 min-w-[140px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {TIME_SLOTS.map(time => (
                <tr key={time}>
                  <td className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                    {time}
                  </td>
                  {DAYS.map(day => {
                    const slotData = getSlotData(day, time);
                    const isLunch = isLunchTime(time);
                    
                    return (
                      <td key={`${day}-${time}`} className="px-1 py-1">
                        {isLunch ? (
                          <div className="h-16 bg-orange-100 border border-orange-200 rounded flex items-center justify-center">
                            <span className="text-sm font-medium text-orange-800">Lunch</span>
                          </div>
                        ) : isEditing ? (
                          <div className="space-y-1">
                            <select
                              value={slotData.subject}
                              onChange={(e) => updateSlot(day, time, 'subject', e.target.value)}
                              className="w-full text-xs p-1 border border-gray-300 rounded"
                            >
                              <option value="">Free</option>
                              {SUBJECTS.map(subject => (
                                <option key={subject.name} value={subject.name}>
                                  {subject.name}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={slotData.notes}
                              onChange={(e) => updateSlot(day, time, 'notes', e.target.value)}
                              placeholder="Notes"
                              className="w-full text-xs p-1 border border-gray-300 rounded"
                            />
                          </div>
                        ) : (
                          <div
                            className="h-16 rounded border-2 border-opacity-20 flex flex-col justify-center p-2 transition-all duration-200 hover:shadow-md cursor-pointer"
                            style={{
                              backgroundColor: slotData.subject ? `${getSubjectColor(slotData.subject)}15` : '#F9FAFB',
                              borderColor: getSubjectColor(slotData.subject),
                            }}
                          >
                            {slotData.subject ? (
                              <>
                                <div
                                  className="text-sm font-semibold mb-1"
                                  style={{ color: getSubjectColor(slotData.subject) }}
                                >
                                  {slotData.subject}
                                </div>
                                {slotData.notes && (
                                  <div className="text-xs text-gray-600 truncate">
                                    {slotData.notes}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-xs text-gray-400 text-center">Free</div>
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

      {/* Today's Schedule */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
        {(() => {
          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          const todaySchedule = timetable.filter(slot => slot.day === today);
          
          if (todaySchedule.length === 0) {
            return <p className="text-gray-500">No classes scheduled for today</p>;
          }
          
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {todaySchedule.map((slot, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border-2 border-opacity-20"
                  style={{
                    backgroundColor: `${getSubjectColor(slot.subject)}15`,
                    borderColor: getSubjectColor(slot.subject),
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getSubjectColor(slot.subject) }}
                    ></div>
                    <span className="font-semibold text-sm">{slot.time}</span>
                  </div>
                  <p className="font-medium text-lg">{slot.subject}</p>
                  {slot.notes && (
                    <p className="text-sm text-gray-600 mt-1">{slot.notes}</p>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default Timetable;