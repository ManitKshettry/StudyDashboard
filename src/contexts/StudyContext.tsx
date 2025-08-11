import React, { createContext, useContext, useState, useEffect } from 'react';
import { Homework, CalendarEvent, Grade, TimetableSlot } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface StudyContextType {
  homework: Homework[];
  calendarEvents: CalendarEvent[];
  grades: Grade[];
  timetable: TimetableSlot[];
  addHomework: (homework: Homework) => void;
  updateHomework: (id: string, updates: Partial<Homework>) => void;
  deleteHomework: (id: string) => void;
  addCalendarEvent: (event: CalendarEvent) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  addGrade: (grade: Grade) => void;
  updateGrade: (id: string, updates: Partial<Grade>) => void;
  deleteGrade: (id: string) => void;
  updateTimetable: (slots: TimetableSlot[]) => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);

  // Load data from Supabase when user is authenticated
  useEffect(() => {
    if (!user) {
      // Clear data when user logs out
      setHomework([]);
      setCalendarEvents([]);
      setGrades([]);
      setTimetable([]);
      return;
    }

    const loadData = async () => {
      try {
        // Load homework
        const { data: homeworkData } = await supabase
          .from('homework')
          .select('*')
          .eq('user_id', user.id)
          .order('due_date', { ascending: true });

        if (homeworkData) {
          setHomework(homeworkData.map(hw => ({
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

        // Load calendar events
        const { data: eventsData } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true });

        if (eventsData) {
          setCalendarEvents(eventsData.map(event => ({
            id: event.id,
            date: event.date,
            time: event.time,
            eventType: event.event_type,
            subject: event.subject,
            description: event.description,
            location: event.location,
            reminderSet: event.reminder_set,
            preparationChecklist: event.preparation_checklist,
          })));
        }

        // Load grades
        const { data: gradesData } = await supabase
          .from('grades')
          .select('*')
          .eq('user_id', user.id)
          .order('date_graded', { ascending: false });

        if (gradesData) {
          setGrades(gradesData.map(grade => ({
            id: grade.id,
            subject: grade.subject,
            assessmentName: grade.assessment_name,
            type: grade.type,
            maxMarks: grade.max_marks,
            marksObtained: grade.marks_obtained,
            grade: grade.grade,
            dateGraded: grade.date_graded,
            feedback: grade.feedback,
            weight: grade.weight,
          })));
        }

        // Load timetable
        const { data: timetableData } = await supabase
          .from('timetable')
          .select('*')
          .eq('user_id', user.id);

        if (timetableData) {
          setTimetable(timetableData.map(slot => ({
            day: slot.day,
            time: slot.time,
            subject: slot.subject,
            notes: slot.notes,
          })));
        }
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
      }
    };

    loadData();
  }, [user]);

  // Homework functions
  const addHomework = async (newHomework: Homework) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('homework')
      .insert({
        user_id: user.id,
        subject: newHomework.subject,
        assignment: newHomework.assignment,
        due_date: newHomework.dueDate,
        assigned_date: newHomework.assignedDate,
        status: newHomework.status,
        priority: newHomework.priority,
        notes: newHomework.notes,
        submission_link: newHomework.submissionLink,
      })
      .select()
      .single();

    if (data && !error) {
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
  };

  const updateHomework = async (id: string, updates: Partial<Homework>) => {
    if (!user) return;

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

    if (!error) {
      setHomework(prev => prev.map(hw => hw.id === id ? { ...hw, ...updates } : hw));
    }
  };

  const deleteHomework = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('homework')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setHomework(prev => prev.filter(hw => hw.id !== id));
    }
  };

  // Calendar functions
  const addCalendarEvent = async (newEvent: CalendarEvent) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: user.id,
        date: newEvent.date,
        time: newEvent.time,
        event_type: newEvent.eventType,
        subject: newEvent.subject,
        description: newEvent.description,
        location: newEvent.location,
        reminder_set: newEvent.reminderSet,
        preparation_checklist: newEvent.preparationChecklist,
      })
      .select()
      .single();

    if (data && !error) {
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
  };

  const updateCalendarEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    if (!user) return;

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

    if (!error) {
      setCalendarEvents(prev => prev.map(event => event.id === id ? { ...event, ...updates } : event));
    }
  };

  const deleteCalendarEvent = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setCalendarEvents(prev => prev.filter(event => event.id !== id));
    }
  };

  // Grades functions
  const addGrade = async (newGrade: Grade) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('grades')
      .insert({
        user_id: user.id,
        subject: newGrade.subject,
        assessment_name: newGrade.assessmentName,
        type: newGrade.type,
        max_marks: newGrade.maxMarks,
        marks_obtained: newGrade.marksObtained,
        grade: newGrade.grade,
        date_graded: newGrade.dateGraded,
        feedback: newGrade.feedback,
        weight: newGrade.weight,
      })
      .select()
      .single();

    if (data && !error) {
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
  };

  const updateGrade = async (id: string, updates: Partial<Grade>) => {
    if (!user) return;

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

    if (!error) {
      setGrades(prev => prev.map(grade => grade.id === id ? { ...grade, ...updates } : grade));
    }
  };

  const deleteGrade = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setGrades(prev => prev.filter(grade => grade.id !== id));
    }
  };

  // ✅ FIXED: Timetable functions
  const updateTimetable = async (slots: TimetableSlot[]) => {
    if (!user) return;

    try {
      // Delete existing timetable
      const { error: deleteError } = await supabase
        .from('timetable')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error deleting timetable:', deleteError);
        return;
      }

      // Insert new timetable slots
      if (slots.length > 0) {
        const { error: insertError } = await supabase
          .from('timetable')
          .insert(
            slots.map(slot => ({
              user_id: user.id,
              day: slot.day,
              time: slot.time,
              subject: slot.subject,
              notes: slot.notes,
            }))
          );

        if (insertError) {
          console.error('Error inserting timetable:', insertError);
          return;
        }
      }
      
      // ✅ Update local state after successful DB operation
      setTimetable(slots);
    } catch (error) {
      console.error('Error updating timetable:', error);
    }
  };

  const value: StudyContextType = {
    homework,
    calendarEvents,
    grades,
    timetable,
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
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
