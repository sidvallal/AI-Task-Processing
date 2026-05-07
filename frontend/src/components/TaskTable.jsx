import React from 'react';
import StatusBadge from './StatusBadge';
import { Eye, Inbox, Loader2, Zap } from 'lucide-react';

/**
 * TaskTable Component
 * Responsive table view of all user tasks.
 * Includes loading skeleton, empty state, and action buttons.
 */

/** Format a date string into a readable format */
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** Display the operation in a human-readable format */
const formatOperation = (op) => {
  const labels = {
    uppercase: 'Uppercase',
    lowercase: 'Lowercase',
    reverse: 'Reverse',
    word_count: 'Word Count',
  };
  return labels[op] || op;
};

/** Loading skeleton rows */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-4 bg-slate-700/50 rounded w-3/4" />
      </td>
    ))}
  </tr>
);

/** Empty state when no tasks exist */
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 mb-4">
      <Inbox className="w-8 h-8 text-slate-600" />
    </div>
    <h3 className="text-lg font-semibold text-slate-300 mb-1">No tasks yet</h3>
    <p className="text-sm text-slate-500 text-center max-w-xs">
      Create your first task above and it will appear here with live status updates.
    </p>
  </div>
);

const TaskTable = ({ tasks, loading, onViewDetails }) => {
  // Show loading state
  if (loading && tasks.length === 0) {
    return (
      <div className="glass-dark rounded-2xl overflow-hidden">
        <div className="flex items-center justify-center py-16 gap-3">
          <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
          <span className="text-slate-400 text-sm">Loading tasks...</span>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!loading && tasks.length === 0) {
    return (
      <div className="glass-dark rounded-2xl overflow-hidden">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="glass-dark rounded-2xl overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Title
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Operation
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Result
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {tasks.map((task) => (
              <tr
                key={task._id}
                className="hover:bg-slate-800/30 transition-colors duration-150"
              >
                <td className="px-5 py-4">
                  <span className="text-sm font-medium text-white truncate block max-w-[200px]">
                    {task.title}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-slate-500" />
                    <span className="text-sm text-slate-300">
                      {formatOperation(task.operation)}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={task.status} />
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-slate-400 font-mono truncate block max-w-[200px]">
                    {task.status === 'success'
                      ? task.result || '—'
                      : task.status === 'failed'
                      ? 'Error'
                      : '—'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-slate-500">
                    {formatDate(task.createdAt)}
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  <button
                    onClick={() => onViewDetails(task)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-400 hover:text-white bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 hover:border-primary-500/40 transition-all duration-200 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-700/30">
        {tasks.map((task) => (
          <div
            key={task._id}
            className="p-4 hover:bg-slate-800/30 transition-colors cursor-pointer"
            onClick={() => onViewDetails(task)}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-sm font-medium text-white truncate flex-1">
                {task.title}
              </h3>
              <StatusBadge status={task.status} />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{formatOperation(task.operation)}</span>
              <span>{formatDate(task.createdAt)}</span>
            </div>
            {task.status === 'success' && task.result && (
              <p className="mt-2 text-xs text-emerald-400 font-mono truncate">
                {task.result}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskTable;
