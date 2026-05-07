import React, { useState } from 'react';
import { Plus, Loader2, Type, FileText, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createTask } from '../services/taskService';

/**
 * TaskForm Component
 * Form for creating new AI processing tasks.
 * Includes title, input text, operation selector with loading/success states.
 */

const operations = [
  { value: 'uppercase', label: 'Uppercase', desc: 'Convert text to UPPERCASE' },
  { value: 'lowercase', label: 'Lowercase', desc: 'Convert text to lowercase' },
  { value: 'reverse', label: 'Reverse', desc: 'Reverse the text string' },
  { value: 'word_count', label: 'Word Count', desc: 'Count words in text' },
];

const TaskForm = ({ onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    inputText: '',
    operation: 'uppercase',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Handle input changes */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /** Submit the task to the API */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.title.trim() || !formData.inputText.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createTask(formData);
      toast.success('Task queued successfully. Processing will begin shortly.');

      // Reset form
      setFormData({ title: '', inputText: '', operation: 'uppercase' });

      // Notify parent to refresh task list
      if (onTaskCreated) onTaskCreated();
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to create task. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-dark rounded-2xl p-6 relative overflow-hidden">
      {/* Accent gradient line */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500" />

      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-indigo-500/20 border border-primary-500/30">
          <Plus className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Create New Task</h2>
          <p className="text-xs text-slate-400">Submit text for AI processing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title Field */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-2">
            <Type className="w-3.5 h-3.5 text-slate-500" />
            Task Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={200}
            placeholder="e.g., Process customer feedback"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-800/70 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all text-sm"
          />
        </div>

        {/* Input Text Field */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-2">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Input Text
          </label>
          <textarea
            name="inputText"
            value={formData.inputText}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Enter the text you want to process..."
            className="w-full px-4 py-2.5 rounded-lg bg-slate-800/70 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all text-sm resize-none"
          />
        </div>

        {/* Operation Selector */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-2">
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            Operation
          </label>
          <div className="grid grid-cols-2 gap-2">
            {operations.map((op) => (
              <button
                key={op.value}
                type="button"
                onClick={() => setFormData({ ...formData, operation: op.value })}
                className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                  formData.operation === op.value
                    ? 'bg-primary-500/15 border-primary-500/40 text-primary-300'
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                }`}
              >
                <span className="text-sm font-medium">{op.label}</span>
                <span className="text-[11px] opacity-70 mt-0.5">{op.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running Task...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Run Task
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;
