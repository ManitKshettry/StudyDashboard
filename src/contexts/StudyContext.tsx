import React, { createContext, useContext, useState, useEffect } from 'react';
import { Homework, CalendarEvent, Grade, TimetableEntry } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { SessionManager } from '../utils/sessionUtils';

interface StudyContextType {
  homework: Homework[];
  calendarEvents: CalendarEvent[];
  grades: Grade[];
  timetable: TimetableEntry[];
  loading: boolean;
  error: string | null;
  addHomework: (hw: Homework) => void;
  updateHomework: (id: string, updates: Partial<Homework>) => void;
  deleteHomework: (id: string) => void;
  addCalendarEvent: (event: CalendarEvent) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  addGrade: (grade: Grade) => void;
  updateGrade: (id: string, updates: Partial<Grade>) => void;
  deleteGrade: (id: string) => void;
  updateTimetable: (day: string, period: number, entry: Partial<TimetableEntry> | null) => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to handle database operations with session validation
  const executeWithValidSession = async <T,>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T | null> => {
    try {
      // Validate session before any database operation
      const isValid = await SessionManager.validateSession();
      if (!isValid) {
        throw new Error('Session invalid, please sign in again');
      }

      return await operation();
    } catch (err: any) {
      console.error(`${operationName} error:`, err);
      
      // Check if it's a session-related error
      if (SessionManager.isRefreshTokenError(err)) {
        setError('Your session has expired. Please sign in again.');
        await SessionManager.clearInvalidSession();
      } else {
        setError(err.message || `Failed to ${operationName.toLowerCase()}`);
      }
      
      return null;
    }
  };

  useEffect(() => {
    if (!user) {
      setHomework([]);
      setCalendarEvents([]);
      setGrades([]);
      setTimetable([]);
      setLoading(false);
      setError(null);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use the session manager to ensure we have a valid session
        const { session, error: sessionError } = await SessionManager.getValidSession();
        
        if (sessionError || !session) {
          console.error('Session validation error:', sessionError);
          if (SessionManager.isRefreshTokenError(sessionError)) {
            await SessionManager.clearInvalidSession();
            setError('Your session has expired. Please sign in again.');
          } else {
            setError('Unable to load data: session invalid');
          }
          return;
        }

        // Load all data with error handling
        await Promise.all([
          loadHomework(),
          loadCalendarEvents(), 
          loadGrades(),
          loadTimetable()
        ]);

      } catch (err: any) {
        console.error('Data loading error:', err);
        if (SessionManager.isRefreshTokenError(err)) {
          setError('Your session has expired. Please sign in again.');
          await SessionManager.clearInvalidSession();
        } else {
          setError(err.message || 'Failed to load data');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const loadHomework = async () => {
    if (!user) return;

    await executeWithValidSession(async () => {
      const { data: hwData, error: hwError } = await supabase
        .from('homework')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (hwError) throw hwError;

      if (hwData) {
        setHomework(hwData.map(hw => ({
          id: hw.id,
          subject: hw.subject,
          assignment: hw.assignment,
          dueDate: hw.due_date,
          assignedDate: hw.assigned_date,
          status: hw.status,
          priority: hw.priority,
          notes: hw.notes,
          submissionLink: hw.submission_link,
        })));
      }
    }, 'Load homework');
  };

  const loadCalendarEvents = async () => {
    if (!user) return;

    await executeWithValidSession(async () => {
      const { data: evData, error: evError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (evError) throw evError;

      if (evData) {
        setCalendarEvents(evData.map(ev => ({
          id: ev.id,
          date: ev.date,
          time: ev.time,
          eventType: ev.event_type,
          subject: ev.subject,
          description: ev.description,
          location: ev.location,
          reminderSet: ev.reminder_set,
          preparationChecklist: ev.preparation_checklist,
        })));
      }
    }, 'Load calendar events');
  };

  const loadGrades = async () => {
    if (!user) return;

    await executeWithValidSession(async () => {
      const { data: grData, error: grError } = await supabase
        .from('grades')
        .select('*')
        .eq('user_id', user.id)
        .order('date_graded', { ascending: false });

      if (grError) throw grError;

      if (grData) {
        setGrades(grData.map(g => ({
          id: g.id,
          subject: g.subject,
          assessmentName: g.assessment_name,
          type: g.type,
          maxMarks: g.max_marks,
          marksObtained: g.marks_obtained,
          grade: g.grade,
          dateGraded: g.date_graded,
          feedback: g.feedback,
          weight: g.weight,
        })));
      }
    }, 'Load grades');
  };

  const loadTimetable = async () => {
    if (!user) return;

    await executeWithValidSession(async () => {
      const { data: ttData, error: ttError } = await supabase
        .from('timetable')
        .select('*')
        .eq('user_id', user.id);

      if (ttError) throw ttError;

      if (ttData) {
        setTimetable(ttData.map(tt => ({
          id: tt.id,
          day: tt.day,
          period: tt.period,
          subject: tt.subject,
          teacher: tt.teacher,
          room: tt.room,
          startTime: tt.start_time,
          endTime: tt.end_time,
        })));
      }
    }, 'Load timetable');
  };

  const addHomework = async (newHw: Homework) => {
    if (!user) return;

    await executeWithValidSession(async () => {
      const { data, error } = await supabase
        .from('homework')
        .insert({
          user_id: user.id,
          subject: newHw.subject,
          assignment: newHw.assignment,
          due_date: newHw.dueDate,
          assigned_date: newHw.assignedDate,
          status: newHw.status,
          priority: newHw.priority,
          notes: newHw.notes,
          submission_link: newHw.submissionLink,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setHomework(prev => [...prev, {
          id: data.id,
          subject: data.subject,
          assignment: data.assignment,
          dueDate: data.due_date,
          assignedDate: data.assigned_date,
          status: data.status,
          priority: data.priority,
          notes: data.notes,
          submissionLink: data.submission_link,
        }]);
      }
    }, 'Add homework');
  };

  const updateHomework = async (id: string, updates: Partial<Homework>) => {
    if (!user) return;

    await executeWithValidSession(async () => {
      const { error } = await supabase
        .from('homework')
        .update({
          subject: updates.subject,
          assignment: updates.assignment,
          due_date: updates.dueDate,
          assigned_date: updates.assignedDate,
          status: updates.status,
          priority: updates.priority,
          notes: updates.notes,
          submission_link: updates.submissionLink,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setHomework(prev => prev.map(hw => (hw.id === id ? { ...hw, ...updates } : hw)));
    }, 'Update homework');
  };

  const deleteHomework = async (id: string) => {
    if (!user) return;

    await executeWithValidSession(async () => {
      const { error } = await supabase
        .from('homework')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setHomework(prev => prev.filter(hw => hw.id !== id));
    }, 'Delete homework');
  };

  const addCalendarEvent = async (newEv: CalendarEvent) => {
    if (!user) return;

    await executeWithValidSession(async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: user.id,
          date: newEv.date,
          time: newEv.time,
          event_type: newEv.eventType,
          subject: newEv.subject,
          description: newEv.description,
          location: newEv.location,
          reminder_set: newEv.reminderSet,
          preparation_checklist: newEv.preparationChecklist,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setCalendarEvents(prev => [...prev, {
          id: data.id,
          date: data.date,
          time: data.time,
          eventType: data.event_type,
          subject: data.subject,
          description: data.description,
          location: data.location,
          reminderSet: data.reminder_set,
          preparationChecklist: data.preparation_checklist,
        }]);
      }
    }, 'Add calendar event');
  };

  const updateCalendarEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    if (!user) return;

    await executeWithValidSession(async () => {
      const { error } = await supabase
        .from('calendar_events')
        .update({
          date: updates.date,
          time: updates.time,
          event_type: updates.eventType,
          subject: updates.subject,
          description: updates.description,
          location: updates.location,
          reminder_set: updates.reminderSet,
          preparation_checklist: updates.preparationChecklist,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCalendarEvents(prev => prev.map(ev => (ev.id === id ? { ...ev, ...updates } : ev)));
    }, 'Update calendar event');
  };

  const deleteCalendarEvent = async (id: string) => {
    if (!user) return;

    await executeWithValidSession(async () => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCalendarEvents(prev => prev.filter(ev => ev.id !== id));
    }, 'Delete calendar event');
  };

  const addGrade = async (newG: Grade) => {
    if (!user) return;

    await executeWithValidSession(async () => {
      const { data, error } = await supabase
        .from('grades')
        .insert({
          user_id: user.id,
          subject: newG.subject,
          assessment_name: newG.assessmentName,
          type: newG.type,
          max_marks: newG.maxMarks,
          marks_obtained: newG.marksObtained,
          grade: newG.grade,
          date_graded: newG.dateGraded,
          feedback: newG.feedback,
          weight: newG.weight,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setGrades(prev => [...prev, {
          id: data.id,
          subject: data.subject,
          assessmentName: data.assessment_name,
          type: data.type,
          maxMarks: data.max_marks,
          marksObtained: data.marks_obtained,
          grade: data.grade,
          dateGraded: data.date_graded,
          feedback: data.feedback,
          weight: data.weight,
        }]);
      }
    }, 'Add grade');
  };

  const updateGrade = async (id: string, updates: Partial<Grade>) => {
    if (!user) return;

    await executeWithValidSession(async () => {
      const { error } = await supabase
        .from('grades')
        .update({
          subject: updates.subject,
          assessment_name: updates.assessmentName,
          type: updates.type,
          max_marks: updates.maxMarks,
          marks_obtained: updates.marksObtained,
          grade: updates.grade,
          date_graded: updates.dateGraded,
          feedback: updates.feedback,
          weight: updates.weight,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setGrades(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)));
    }, 'Update grade');
  };

  const deleteGrade = async (id: string) => {
    if (!user) return;

    await executeWithValidSession(async () => {
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setGrades(prev => prev.filter(g => g.id !== id));
    }, 'Delete grade');
  };

  const updateTimetable = async (day: string, period: number, entry: Partial<TimetableEntry> | null) => {
    if (!user) return;

    await executeWithValidSession(async () => {
      // Find existing entry
      const existingEntry = timetable.find(t => t.day === day && t.period === period);

      if (entry === null) {
        // Delete entry
        if (existingEntry) {
          const { error } = await supabase
            .from('timetable')
            .delete()
            .eq('id', existingEntry.id)
            .eq('user_id', user.id);

          if (error) throw error;

          setTimetable(prev => prev.filter(t => t.id !== existingEntry.id));
        }
      } else {
        if (existingEntry) {
          // Update existing entry
          const { error } = await supabase
            .from('timetable')
            .update({
              subject: entry.subject,
              teacher: entry.teacher,
              room: entry.room,
              start_time: entry.startTime,
              end_time: entry.endTime,
            })
            .eq('id', existingEntry.id)
            .eq('user_id', user.id);

          if (error) throw error;

          setTimetable(prev => prev.map(t =>
            t.id === existingEntry.id
              ? { ...t, ...entry }
              : t
          ));
        } else {
          // Create new entry
          const { data, error } = await supabase
            .from('timetable')
            .insert({
              user_id: user.id,
              day,
              period,
              subject: entry.subject || '',
              teacher: entry.teacher || '',
              room: entry.room || '',
              start_time: entry.startTime || '',
              end_time: entry.endTime || '',
            })
            .select()
            .single();

          if (error) throw error;

          if (data) {
            setTimetable(prev => [...prev, {
              id: data.id,
              day: data.day,
              period: data.period,
              subject: data.subject,
              teacher: data.teacher,
              room: data.room,
              startTime: data.start_time,
              endTime: data.end_time,
            }]);
          }
        }
      }
    }, 'Update timetable');
  };

  const value: StudyContextType = {
    homework,
    calendarEvents,
    grades,
    timetable,
    loading,
    error,
    addHomework,
    updateHomework,
    deleteHomework,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    addGrade,
    updateGrade,
    deleteGrade,
    updateTimetable,
  };

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
};

export const useStudy = () => {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error('useStudy must be used within StudyProvider');
  return ctx;
};