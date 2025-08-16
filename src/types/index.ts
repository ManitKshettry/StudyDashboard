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

export interface TimetableEntry {
  id: string;
  day: string;
  period: number;
  subject: string;
  teacher: string;
  room: string;
  startTime: string;
  endTime: string;
}

export interface Subject {
  name: string;
  color: string;
}

export const SUBJECTS: Subject[] = [
  { name: 'Math', color: '#ff8800ff' },
  { name: 'English', color: '#3510b9ff' },
  { name: 'Physics', color: '#e6b71eff' },
  { name: 'Chemistry', color: '#1916cfff' },
  { name: 'Biology', color: '#ccc016ff' },
  { name: 'History', color: '#F59E0B' },
  { name: 'Geography', color: '#7dbe14ff' },
  { name: 'Computer', color: '#7706d4ff' },
];