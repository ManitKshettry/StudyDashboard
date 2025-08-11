import { Grade } from '../types';

export const calculatePercentage = (marksObtained: number, maxMarks: number): number => {
  return Math.round((marksObtained / maxMarks) * 100);
};

export const getLetterGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C+';
  if (percentage >= 50) return 'C';
  return 'F';
};

export const calculateWeightedAverage = (grades: Grade[]): number => {
  if (grades.length === 0) return 0;
  
  const totalWeightedMarks = grades.reduce((sum, grade) => {
    const percentage = calculatePercentage(grade.marksObtained, grade.maxMarks);
    return sum + (percentage * grade.weight);
  }, 0);
  
  const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);
  
  return totalWeight > 0 ? Math.round(totalWeightedMarks / totalWeight) : 0;
};

export const calculateSubjectAverage = (grades: Grade[], subject: string): number => {
  const subjectGrades = grades.filter(grade => grade.subject === subject);
  return calculateWeightedAverage(subjectGrades);
};

export const getGradeColor = (percentage: number): string => {
  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 80) return 'text-blue-600';
  if (percentage >= 70) return 'text-yellow-600';
  if (percentage >= 60) return 'text-orange-600';
  return 'text-red-600';
};