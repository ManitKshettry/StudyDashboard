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