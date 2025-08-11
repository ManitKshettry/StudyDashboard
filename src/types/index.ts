export interface Homework {
  id: string;
  subject: string;
  assignment: string;
  dueDate: string;
  assignedDate: string;
  status: 'Not Started' | 'In Progress' | 'Needs Revision' | 'Completed' | 'Submitted';
  priority: 'High' | 'Medium' | 'Low';
  notes: string;
  submissionLink?: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  eventType: 'Exam' | 'Quiz' | 'Homework Due' | 'Project' | 'Assignment';
  subject: string;
  description: string;
  location: string;
  reminderSet: boolean;
  preparationChecklist: string[];
}

export interface Grade {
  id: string;
  subject: string;
  assessmentName: string;
  type: 'Exam' | 'Assignment' | 'Quiz' | 'Project';
  maxMarks: number;
  marksObtained: number;
  grade: string;
  dateGraded: string;
  feedback: string;
  weight: number;
}

export interface TimetableSlot {
  day: string;
  time: string;
  subject: string;
  notes?: string;
}

export interface Subject {
  name: string;
  color: string;
}

export const SUBJECTS: Subject[] = [
  { name: 'Math', color: '#ff8800ff' },
  { name: 'English', color: '#3510b9ff' },
  // { name: 'English', color: '#10B981' },
  { name: 'Physics', color: '#e6b71eff' },
  { name: 'Chemistry', color: '#1916cfff' },
  { name: 'Biology', color: '#ccc016ff' },
  { name: 'History', color: '#F59E0B' },
  { name: 'Geography', color: '#7dbe14ff' },
  { name: 'Computer', color: '#7706d4ff' },
  
];

export const TIME_SLOTS = [
  '2:00-2:30', '2:30-4:00', '4:00-5:00', '5:00-6:30',
  '6:30-8:00', '8:00-9:30', '9:30-11:00'
];

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday','Saterday','Sunday'];