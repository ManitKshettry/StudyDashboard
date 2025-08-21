import React, { useState } from 'react';
import { useStudy } from '../contexts/StudyContext';
import { SUBJECTS } from '../types';
import { getDaysLeft, isOverdue, formatDate } from '../utils/dateUtils';
import { Plus, Edit2, Trash2, ExternalLink, Calendar, AlertCircle } from 'lucide-react';

const HomeworkTracker: React.FC = () => {
  // ...[rest of the code remains unchanged up to the rendering section]...

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Homework Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your assignments and track progress</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Homework
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
          {/* ... your existing form fields, update all input/select/textarea with dark: classes like above ... */}
        </div>
      )}

      {/* Homework Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Subject</th>
                {/* Repeat for other header cells */}
              </tr>
            </thead>
            <tbody>
              {sortedHomework.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No homework assignments yet. Add one to get started!
                  </td>
                </tr>
              ) : (
                sortedHomework.map((hw) => {
                  const overdue = isOverdue(hw.dueDate);
                  const subjectColor = SUBJECTS.find(s => s.name === hw.subject)?.color || '#6B7280';
                  return (
                    <tr key={hw.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subjectColor }}
                          ></div>
                          <span className="font-medium">{hw.subject}</span>
                        </div>
                      </td>
                      {/* Repeat for other cells, updating classes */}
                      <td className="px-4 py-3 text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(hw)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteHomework(hw.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          {hw.submissionLink && (
                            <a
                              href={hw.submissionLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
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

export default HomeworkTracker;
