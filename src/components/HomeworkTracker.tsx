import React, { useState } from 'react';
import { useStudy } from '../contexts/StudyContext';
import { SUBJECTS } from '../types';
import { useAuth } from '../contexts/AuthContext'; // ← ADD THIS LINE
import { getDaysLeft, isOverdue, formatDate } from '../utils/dateUtils';
import { Plus, Edit2, Trash2, ExternalLink, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

const HomeworkTracker: React.FC = () => {
  const { homework, addHomework, updateHomework, deleteHomework } = useStudy();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    assignment: '',
    dueDate: '',
    status: 'Not Started' as const,
    priority: 'Medium' as const,
    notes: '',
    submissionLink: '',
  });

  const resetForm = () => {
    setFormData({
      subject: '',
      assignment: '',
      dueDate: '',
      status: 'Not Started',
      priority: 'Medium',
      notes: '',
      submissionLink: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Make sure dueDate is not empty and is a valid date
    if (!formData.dueDate) {
      alert('Please select a valid due date');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    if (editingId) {
      updateHomework(editingId, { ...formData, assignedDate: today });
    } else {
      const newHomework = {
        ...formData,
        assignedDate: today,
        id: Date.now().toString(),
      };
      addHomework(newHomework);
    }
    
    resetForm();
  };

  const handleEdit = (hw: any) => {
    setFormData({
      subject: hw.subject,
      assignment: hw.assignment,
      dueDate: hw.dueDate,
      status: hw.status,
      priority: hw.priority,
      notes: hw.notes,
      submissionLink: hw.submissionLink || '',
    });
    setEditingId(hw.id);
    setShowForm(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Needs Revision': return 'bg-amber-100 text-amber-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Submitted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedHomework = homework.sort((a, b) => {
    // First sort by overdue status
    const aOverdue = isOverdue(a.dueDate);
    const bOverdue = isOverdue(b.dueDate);
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
    
    // Then by days left
    return getDaysLeft(a.dueDate) - getDaysLeft(b.dueDate);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Homework Tracker</h1>
          <p className="text-gray-600 mt-1">Manage your assignments and track progress</p>
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
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Homework' : 'Add New Homework'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Subject</option>
                  {SUBJECTS.map(subject => (
                    <option key={subject.name} value={subject.name}>{subject.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignment</label>
                <input
                  type="text"
                  value={formData.assignment}
                  onChange={(e) => setFormData({ ...formData, assignment: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Needs Revision">Needs Revision</option>
                  <option value="Completed">Completed</option>
                  <option value="Submitted">Submitted</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submission Link (Optional)</label>
              <input
                type="url"
                value={formData.submissionLink}
                onChange={(e) => setFormData({ ...formData, submissionLink: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingId ? 'Update' : 'Add'} Homework
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Homework List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Subject</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Assignment</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Due Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Priority</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Days Left</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedHomework.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No homework assignments yet. Add one to get started!
                  </td>
                </tr>
              ) : (
                sortedHomework.map((hw) => {
                  const daysLeft = getDaysLeft(hw.dueDate);
                  const overdue = isOverdue(hw.dueDate);
                  const subjectColor = SUBJECTS.find(s => s.name === hw.subject)?.color || '#6B7280';
                  
                  return (
                    <tr key={hw.id} className={`hover:bg-gray-50 ${overdue ? 'bg-red-25' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subjectColor }}
                          ></div>
                          <span className="font-medium">{hw.subject}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{hw.assignment}</p>
                          {hw.notes && (
                            <p className="text-sm text-gray-600 mt-1">{hw.notes}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{formatDate(hw.dueDate)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hw.status)}`}>
                          {hw.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded border text-xs font-medium ${getPriorityColor(hw.priority)}`}>
                          {hw.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {overdue ? (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-600 font-medium">OVERDUE</span>
                            </>
                          ) : (
                            <>
                              {daysLeft <= 1 && <AlertCircle className="h-4 w-4 text-amber-500" />}
                              <span className={`font-medium ${
                                daysLeft <= 1 ? 'text-red-600' : 
                                daysLeft <= 3 ? 'text-amber-600' : 
                                'text-green-600'
                              }`}>
                                {daysLeft === 0 ? 'Today' : `${daysLeft} days`}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
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