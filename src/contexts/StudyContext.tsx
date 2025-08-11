// src/contexts/StudyContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Homework, CalendarEvent, Grade } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface StudyContextType {
  homework: Homework[];
  calendarEvents: CalendarEvent[];
  grades: Grade[];
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
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setHomework([]);
      setCalendarEvents([]);
      setGrades([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      setError('Missing Supabase configuration. Please check your environment variables.');
      setLoading(false);
      return;
    }
    
    console.log('Supabase configuration check passed');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key length:', supabaseKey?.length || 0);

    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent hanging queries
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Data loading timeout after 10 seconds')), 10000);
      });
      
      const dataLoadingPromise = async () => {
        try {
          console.log('Loading data for user:', user.id);
          
          // Skip health check since we know user is authenticated
          console.log('User is authenticated, proceeding with database tests...');
          
          // Test database connection first with a simple query
          console.log('Testing database connection with simple query...');
          
          // Query profiles table with timeout
          let testData: any = null;
          let testError: any = null;
          
          try {
            const startTime = Date.now();
            
            // Try to query profiles with a timeout
            const profilesPromise = supabase
              .from('profiles')
              .select('id')
              .eq('id', user.id)
              .single();
              
            // Add a timeout
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Profiles query timeout after 3 seconds')), 3000);
            });
            
            const result = await Promise.race([profilesPromise, timeoutPromise]) as any;
            
            const queryTime = Date.now() - startTime;
            console.log(`Profiles query completed in ${queryTime}ms`);
            
            testData = result.data;
            testError = result.error;
          } catch (error) {
            console.error('Profiles query failed or timed out:', error);
            
            // If it's a timeout, try to create the profile manually
            if (error instanceof Error && error.message.includes('timeout')) {
              console.log('Profiles query timed out, trying to create profile manually...');
              
              try {
                const { data: createResult, error: createError } = await supabase
                  .from('profiles')
                  .insert({
                    id: user.id,
                    email: user.email!,
                    full_name: user.user_metadata?.full_name || user.user_metadata?.name || ''
                  })
                  .select()
                  .single();
                  
                if (createError) {
                  console.error('Failed to create profile manually:', createError);
                  throw new Error(`Failed to create profile: ${createError.message}`);
                }
                
                console.log('Profile created manually:', createResult);
                testData = createResult;
                testError = null;
              } catch (createError) {
                console.error('Manual profile creation failed:', createError);
                testError = createError;
              }
            } else {
              testError = error;
            }
          }
            
          if (testError) {
            console.error('Database connection test failed:', testError);
            throw new Error(`Database connection failed: ${testError.message}`);
          }
          
          console.log('Database connection test successful:', testData);
          
          // Check if user profile exists
          if (!testData) {
            console.log('User profile not found, this might be the issue');
            throw new Error('User profile not found in database. This suggests the trigger to create profiles is not working.');
          }
          
          console.log('User profile exists:', testData);
          
          // If we get here, the profile exists, so let's test a simple query to other tables
          console.log('Testing simple queries to other tables...');
          
          // Test with a simple count query first
          const { count: hwCount, error: hwCountError } = await supabase
            .from('homework')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
            
          if (hwCountError) {
            console.error('Homework count query failed:', hwCountError);
            throw new Error(`Homework table access failed: ${hwCountError.message}`);
          }
          
          console.log('Homework count query successful, count:', hwCount);
          
          // Now load the actual data
          console.log('Loading homework data...');
          const { data: hwData, error: hwError } = await supabase
            .from('homework')
            .select('*')
            .eq('user_id', user.id)
            .order('due_date', { ascending: true });
            
          if (hwError) {
            console.error('Error loading homework:', hwError);
            throw new Error(`Failed to load homework: ${hwError.message}`);
          }
          
          console.log('Homework data loaded:', hwData?.length || 0, 'items');
          
          if (hwData) {
            setHomework(
              hwData.map(hw => ({
                id: hw.id,
                subject: hw.subject,
                assignment: hw.assignment,
                dueDate: hw.due_date,
                assignedDate: hw.assigned_date,
                status: hw.status,
                priority: hw.priority,
                notes: hw.notes,
                submissionLink: hw.submission_link,
              }))
            );
          }

          // Load calendar events
          console.log('Loading calendar events data...');
          const { data: evData, error: evError } = await supabase
            .from('calendar_events')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: true });
            
          if (evError) {
            console.error('Error loading calendar events:', evError);
            throw new Error(`Failed to load calendar events: ${evError.message}`);
          }
          
          console.log('Calendar events data loaded:', evData?.length || 0, 'items');
          
          if (evData) {
            setCalendarEvents(
              evData.map(ev => ({
                id: ev.id,
                date: ev.date,
                time: ev.time,
                eventType: ev.event_type,
                subject: ev.subject,
                description: ev.description,
                location: ev.location,
                reminderSet: ev.reminder_set,
                preparationChecklist: ev.preparation_checklist,
              }))
            );
          }

          // Load grades
          console.log('Loading grades data...');
          const { data: grData, error: grError } = await supabase
            .from('grades')
            .select('*')
            .eq('user_id', user.id)
            .order('date_graded', { ascending: false });
            
          if (grError) {
            console.error('Error loading grades:', grError);
            throw new Error(`Failed to load grades: ${grError.message}`);
          }
          
          console.log('Grades data loaded:', grData?.length || 0, 'items');
          
          if (grData) {
            setGrades(
              grData.map(g => ({
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
              }))
            );
          }
          
          console.log('All data loaded successfully!');
        } catch (error) {
          console.error('Error loading data:', error);
          throw error;
        }
      };
      
      try {
        await Promise.race([dataLoadingPromise(), timeoutPromise]);
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const addHomework = async (newHw: Homework) => {
    if (!user) return;
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
    if (data && !error) {
      setHomework(prev => [
        ...prev,
        {
          id: data.id,
          subject: data.subject,
          assignment: data.assignment,
          dueDate: data.due_date,
          assignedDate: data.assigned_date,
          status: data.status,
          priority: data.priority,
          notes: data.notes,
          submissionLink: data.submission_link,
        },
      ]);
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
      setHomework(prev => prev.map(hw => (hw.id === id ? { ...hw, ...updates } : hw)));
    }
  };

  const deleteHomework = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('homework')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (!error) setHomework(prev => prev.filter(hw => hw.id !== id));
  };

  const addCalendarEvent = async (newEv: CalendarEvent) => {
    if (!user) return;
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
    if (data && !error) {
      setCalendarEvents(prev => [
        ...prev,
        {
          id: data.id,
          date: data.date,
          time: data.time,
          eventType: data.event_type,
          subject: data.subject,
          description: data.description,
          location: data.location,
          reminderSet: data.reminder_set,
          preparationChecklist: data.preparation_checklist,
        },
      ]);
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
      setCalendarEvents(prev => prev.map(ev => (ev.id === id ? { ...ev, ...updates } : ev)));
    }
  };

  const deleteCalendarEvent = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (!error) setCalendarEvents(prev => prev.filter(ev => ev.id !== id));
  };

  const addGrade = async (newG: Grade) => {
    if (!user) return;
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
    if (data && !error) {
      setGrades(prev => [
        ...prev,
        {
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
        },
      ]);
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
      setGrades(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)));
    }
  };

  const deleteGrade = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (!error) setGrades(prev => prev.filter(g => g.id !== id));
  };

  const value: StudyContextType = {
    homework,
    calendarEvents,
    grades,
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
  };

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
};

export const useStudy = () => {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error('useStudy must be used within StudyProvider');
  return ctx;
};
