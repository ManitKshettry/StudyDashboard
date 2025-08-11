import React, { useState, useEffect } from 'react';
import { useStudy } from '../contexts/StudyContext';
import { SUBJECTS, TIME_SLOTS, DAYS } from '../types';
import { Edit2, Save, X } from 'lucide-react';

const Timetable: React.FC = () => {
  const { timetable, updateTimetable } = useStudy();
  const [localTimetable, setLocalTimetable] = useState(timetable);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<{ [k: string]: { subject: string; notes: string } }>({});

  // Sync editData and localTimetable whenever context timetable changes
  useEffect(() => {
    const data: typeof editData = {};
    DAYS.forEach(day => {
      TIME_SLOTS.forEach(time => {
        const key = `${day}-${time}`;
        const slot = timetable.find(s => s.day === day && s.time === time);
        data[key] = { subject: slot?.subject || '', notes: slot?.notes || '' };
      });
    });
    setEditData(data);
    setLocalTimetable(timetable);
  }, [timetable]);

  const handleSave = () => {
    const newSlots = Object.entries(editData)
      .filter(([, v]) => v.subject.trim())
      .map(([key, v]) => {
        const [day, time] = key.split('-');
        return { day, time, subject: v.subject, notes: v.notes };
      });

    // 1️⃣ immediate UI update
    setLocalTimetable(newSlots);
    // 2️⃣ persist to Supabase + context
    updateTimetable(newSlots);
    setIsEditing(false);
  };

  const getSlot = (day: string, time: string) => {
    if (isEditing) return editData[`${day}-${time}`] || { subject: '', notes: '' };
    return localTimetable.find(s => s.day === day && s.time === time) || { subject: '', notes: '' };
  };

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySlots = localTimetable.filter(s => s.day === todayName);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Weekly Timetable</h1>
          <p className="text-gray-600">Your class schedule and notes</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn-blue">
              <Edit2 /> Edit
            </button>
          ) : (
            <>
              <button onClick={handleSave} className="btn-green">
                <Save /> Save
              </button>
              <button onClick={() => setIsEditing(false)} className="btn-gray">
                <X /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Legend omitted for brevity */}

      <div className="overflow-x-auto bg-white rounded border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2">Time</th>
              {DAYS.map(day => (
                <th key={day} className="px-3 py-2">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map(time => (
              <tr key={time}>
                <td className="px-3 py-2">{time}</td>
                {DAYS.map(day => {
                  const slot = getSlot(day, time);
                  const lunch = time === '2:00-2:30';
                  return (
                    <td key={day + time} className="px-1 py-1">
                      {lunch ? (
                        <div className="h-16 bg-orange-100 flex items-center justify-center">Lunch</div>
                      ) : isEditing ? (
                        <div className="space-y-1">
                          <select
                            value={slot.subject}
                            onChange={e => {
                              const key = `${day}-${time}`;
                              setEditData(d => ({ ...d, [key]: { ...d[key], subject: e.target.value } }));
                            }}
                            className="w-full p-1 border"
                          >
                            <option value="">Free</option>
                            {SUBJECTS.map(s => (
                              <option key={s.name} value={s.name}>{s.name}</option>
                            ))}
                          </select>
                          <input
                            value={slot.notes}
                            onChange={e => {
                              const key = `${day}-${time}`;
                              setEditData(d => ({ ...d, [key]: { ...d[key], notes: e.target.value } }));
                            }}
                            placeholder="Notes"
                            className="w-full p-1 border"
                          />
                        </div>
                      ) : (
                        <div
                          className="h-16 flex flex-col justify-center p-2 border rounded"
                          style={{
                            backgroundColor: slot.subject
                              ? `${SUBJECTS.find(s => s.name === slot.subject)?.color}15`
                              : '#F9FAFB',
                          }}
                        >
                          {slot.subject || <span className="text-gray-400">Free</span>}
                          {slot.notes && <small className="text-gray-600">{slot.notes}</small>}
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

      {/* Today's Schedule */}
      <div className="bg-white p-4 rounded border">
        <h2 className="text-xl font-semibold">Today's Schedule</h2>
        {todaySlots.length === 0 ? (
          <p className="text-gray-500">No classes today</p>
        ) : (
          todaySlots.map((s, i) => (
            <div key={i} className="mt-2 p-2 border rounded" style={{ backgroundColor: `${SUBJECTS.find(su => su.name === s.subject)?.color}15` }}>
              <strong>{s.time}</strong>: {s.subject}
              {s.notes && <div className="text-sm">{s.notes}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Timetable;
