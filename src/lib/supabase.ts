import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.supabase = supabase;
}

export type Database = {
  public: {
    Tables: {
      homework: {
        Row: {
          id: string
          user_id: string
          subject: string
          assignment: string
          due_date: string
          assigned_date: string
          status: 'Not Started' | 'In Progress' | 'Needs Revision' | 'Completed' | 'Submitted'
          priority: 'High' | 'Medium' | 'Low'
          notes: string
          submission_link: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          assignment: string
          due_date: string
          assigned_date: string
          status?: 'Not Started' | 'In Progress' | 'Needs Revision' | 'Completed' | 'Submitted'
          priority?: 'High' | 'Medium' | 'Low'
          notes?: string
          submission_link?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          assignment?: string
          due_date?: string
          assigned_date?: string
          status?: 'Not Started' | 'In Progress' | 'Needs Revision' | 'Completed' | 'Submitted'
          priority?: 'High' | 'Medium' | 'Low'
          notes?: string
          submission_link?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          date: string
          time: string
          event_type: 'Exam' | 'Quiz' | 'Homework Due' | 'Project' | 'Assignment'
          subject: string
          description: string
          location: string
          reminder_set: boolean
          preparation_checklist: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          time: string
          event_type: 'Exam' | 'Quiz' | 'Homework Due' | 'Project' | 'Assignment'
          subject: string
          description: string
          location?: string
          reminder_set?: boolean
          preparation_checklist?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          time?: string
          event_type?: 'Exam' | 'Quiz' | 'Homework Due' | 'Project' | 'Assignment'
          subject?: string
          description?: string
          location?: string
          reminder_set?: boolean
          preparation_checklist?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      grades: {
        Row: {
          id: string
          user_id: string
          subject: string
          assessment_name: string
          type: 'Exam' | 'Assignment' | 'Quiz' | 'Project'
          max_marks: number
          marks_obtained: number
          grade: string
          date_graded: string
          feedback: string
          weight: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          assessment_name: string
          type: 'Exam' | 'Assignment' | 'Quiz' | 'Project'
          max_marks: number
          marks_obtained: number
          grade: string
          date_graded: string
          feedback?: string
          weight: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          assessment_name?: string
          type?: 'Exam' | 'Assignment' | 'Quiz' | 'Project'
          max_marks?: number
          marks_obtained?: number
          grade?: string
          date_graded?: string
          feedback?: string
          weight?: number
          created_at?: string
          updated_at?: string
        }
      }
      timetable: {
        Row: {
          id: string
          user_id: string
          day: string
          period: number
          subject: string
          teacher: string
          room: string
          start_time: string
          end_time: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          day: string
          period: number
          subject: string
          teacher: string
          room: string
          start_time: string
          end_time: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          day?: string
          period?: number
          subject?: string
          teacher?: string
          room?: string
          start_time?: string
          end_time?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}