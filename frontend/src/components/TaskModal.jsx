import React, { useEffect, useState } from 'react';
import {
  X,
  Clock,
  Zap,
  FileText,
  Terminal,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { getTaskById } from '../services/taskService';
import { toast } from 'react-hot-toast';

/**
 * TaskModal Component
 * Full-detail modal overlay for a single task.
 * Shows title, input text, operation, status, result, and processing logs timeline.
 * Auto-fetches latest task data by ID for real-time updates.
 */
const TaskModal = ({ task: initialTask, onClose }) => {
  const [task, setTask] = useState(initialTask);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  /** Fetch the latest task data on mount */
  useEffect(() => {
    const fetchLatest = async () => {
      setLoading(true);
      try {
        const data = await getTaskById(initialTask._id);
        setTask(data.task);
      } catch (error) {
        console.error('Failed to fetch task details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, [initialTask._id]);

  /** Close modal on Escape key */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  /** Prevent background scroll when modal is open */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  /** Copy result to clipboard */
  const handleCopyResult = async () => {
    if (task.result) {
      try {
        await navigator.clipboard.writeText(task.result);
        setCopied(true);
        toast.success('Result copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error('Failed to copy');
      }
    }
  };

  /** Format date to readable string */
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  /** Format operation label */
  const formatOperation = (op) => {
    const labels = {
      uppercase: 'Uppercase',
      lowercase: 'Lowercase',
      reverse: 'Reverse',
      word_count: 'Word Count',
    };
    return labels[op] || op;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 animate-slide-up">
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500" />

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500/20 to-indigo-500/20 border border-primary-500/30 shrink-0">
              <FileText className="w-4 h-4 text-primary-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-white truncate">
                {task.title}
              </h2>
              <p className="text-xs text-slate-500">Task Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5">
            {/* Status + Operation + Date row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
                  Status
                </span>
                <StatusBadge status={task.status} />
              </div>
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
                  Operation
                </span>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-sm text-white font-medium">
                    {formatOperation(task.operation)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
                  Created
                </span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-300">
                    {formatDate(task.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Input Text */}
            <div>
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 mb-2">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Input Text
              </h3>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/30">
                <p className="text-sm text-slate-300 whitespace-pre-wrap break-words leading-relaxed">
                  {task.inputText}
                </p>
              </div>
            </div>

            {/* Result */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-300">
                  {task.status === 'success' ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : task.status === 'failed' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  Result
                </h3>
                {task.status === 'success' && task.result && (
                  <button
                    onClick={handleCopyResult}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <div
                className={`p-4 rounded-xl border ${
                  task.status === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : task.status === 'failed'
                    ? 'bg-rose-500/10 border-rose-500/20'
                    : 'bg-slate-800/60 border-slate-700/30'
                }`}
              >
                <p
                  className={`text-sm font-mono whitespace-pre-wrap break-words ${
                    task.status === 'success'
                      ? 'text-emerald-300'
                      : task.status === 'failed'
                      ? 'text-rose-300'
                      : 'text-slate-500 italic'
                  }`}
                >
                  {task.status === 'success'
                    ? task.result || 'No result'
                    : task.status === 'failed'
                    ? 'Task processing failed'
                    : 'Awaiting processing...'}
                </p>
              </div>
            </div>

            {/* Processing Logs Timeline */}
            {task.logs && task.logs.length > 0 && (
              <div>
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 mb-3">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  Processing Logs
                </h3>
                <div className="space-y-0">
                  {task.logs.map((log, index) => (
                    <div key={index} className="flex gap-3">
                      {/* Timeline line + dot */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            index === task.logs.length - 1
                              ? 'bg-primary-400 shadow-sm shadow-primary-400/50'
                              : 'bg-slate-600'
                          }`}
                        />
                        {index < task.logs.length - 1 && (
                          <div className="w-px flex-1 bg-slate-700/50 my-1" />
                        )}
                      </div>
                      {/* Log content */}
                      <div className="pb-3">
                        <p className="text-xs text-slate-300 font-mono leading-relaxed">
                          {log}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty logs state */}
            {(!task.logs || task.logs.length === 0) && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/40 border border-slate-700/20">
                <Terminal className="w-4 h-4 text-slate-600" />
                <span className="text-xs text-slate-500">
                  No processing logs available yet
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskModal;
