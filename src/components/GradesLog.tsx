import React, { useState } from 'react';
import { useStudy } from '../contexts/StudyContext';
import { SUBJECTS } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { calculatePercentage, getLetterGrade, calculateWeightedAverage, calculateSubjectAverage, getGradeColor } from '../utils/gradeUtils';
import { Plus, Edit2, Trash2, TrendingUp, Trophy } from 'lucide-react';

const GradesLog: React.FC = () => {
  const { grades, addGrade, updateGrade, deleteGrade } = useStudy();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    assessmentName: '',
    type: 'Assignment' as const,
    maxMarks: '',
    marksObtained: '',
    dateGraded: '',
    feedback: '',
    weight: '',
  });

  const resetForm = () => {
    setFormData({
      subject: '',
      assessmentName: '',
      type: 'Assignment',
      maxMarks: '',
      marksObtained: '',
      dateGraded: '',
      feedback: '',
      weight: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gradeData = {
      ...formData,
      dateGraded: formData.dateGraded,
      maxMarks: parseInt(formData.maxMarks),
      marksObtained: parseInt(formData.marksObtained),
      weight: parseFloat(formData.weight),
      grade: getLetterGrade(calculatePercentage(parseInt(formData.marksObtained), parseInt(formData.maxMarks))),
    };

    if (editingId) {
      updateGrade(editingId, gradeData);
    } else {
      const newGrade = {
        ...gradeData,
        id: Date.now().toString(),
      };
      addGrade(newGrade);
    }
    resetForm();
  };

  const handleEdit = (grade: any) => {
    setFormData({
      subject: grade.subject,
      assessmentName: grade.assessmentName,
      type: grade.type,
      maxMarks: grade.maxMarks.toString(),
      marksObtained: grade.marksObtained.toString(),
      dateGraded: grade.dateGraded,
      feedback: grade.feedback,
      weight: grade.weight.toString(),
    });
    setEditingId(grade.id);
    setShowForm(true);
  };

  const overallAverage = calculateWeightedAverage(grades);
  const subjectAverages = SUBJECTS.map(subject => ({
    ...subject,
    average: calculateSubjectAverage(grades, subject.name),
    count: grades.filter(g => g.subject === subject.name).length,
  })).filter(subject => subject.count > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Grades Log</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your academic performance and progress</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Grade
        </button>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Overall Average */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg transition-colors duration-200">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8" />
            <h3 className="text-lg font-semibold">Overall Average</h3>
          </div>
          <div className="text-3xl font-bold mb-1">{overallAverage}%</div>
          <div className="text-blue-100">{getLetterGrade(overallAverage)} Grade</div>
        </div>

        {/* Subject Averages */}
        {subjectAverages.slice(0, 2).map((subject) => (
          <div key={subject.name} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: subject.color }}
              ></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{subject.name}</h3>
            </div>
            <div className={`text-3xl font-bold mb-1 ${getGradeColor(subject.average)}`}>
              {subject.average}%
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              {subject.count} assessment{subject.count !== 1 ? 's' : ''}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {editingId ? 'Edit Grade' : 'Add New Grade'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Subject</option>
                  {SUBJECTS.map(subject => (
                    <option key={subject.name} value={subject.name}>{subject.name}</option>
                  ))}
                </select>
              </div>
              {/* Repeat for other form fields, updating classes as above */}
            </div>
            {/* Additional textarea input with dark mode nested */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Feedback</label>
              <textarea
                value={formData.feedback}
                onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                rows={3}
              />
            </div>
            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingId ? 'Update' : 'Add'} Grade
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grades Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Subject</th>
                {/* repeat for each th */}
              </tr>
            </thead>
            <tbody>
              {/* White/dark text for each cell and row */}
              {grades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No grades recorded yet. Add your first grade to get started!
                  </td>
                </tr>
              ) : (
                grades.map((grade) => {
                  const percentage = calculatePercentage(grade.marksObtained, grade.maxMarks);
                  const subjectColor = SUBJECTS.find(s => s.name === grade.subject)?.color || '#6B7280';
                  return (
                    <tr key={grade.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subjectColor }}
                          ></div>
                          <span className="font-medium">{grade.subject}</span>
                        </div>
                      </td>
                      {/* Repeat for other cells, updating classes */}
                      <td className="px-4 py-3 text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(grade)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteGrade(grade.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GradesLog;
