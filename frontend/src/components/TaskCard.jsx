import React from 'react';
import StatusBadge from './StatusBadge';
import { ArrowUpRight, Calendar, Zap } from 'lucide-react';

/**
 * TaskCard Component
 * Card-based view for a single task (used in mobile/grid layouts).
 * Shows title, operation, status badge, result preview, and created time.
 */
const TaskCard = ({ task, onViewDetails }) => {
  /** Format a date string into a readable format */
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
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

  return (
    <div
      className="group glass-dark rounded-xl p-5 hover:border-primary-500/30 transition-all duration-300 cursor-pointer relative overflow-hidden"
      onClick={() => onViewDetails(task)}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        {/* Header: Title + Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-sm font-semibold text-white truncate flex-1">
            {task.title}
          </h3>
          <StatusBadge status={task.status} />
        </div>

        {/* Operation */}
        <div className="flex items-center gap-1.5 mb-3">
          <Zap className="w-3 h-3 text-slate-500" />
          <span className="text-xs text-slate-400 font-medium">
            {formatOperation(task.operation)}
          </span>
        </div>

        {/* Result Preview */}
        {task.status === 'success' && task.result && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs text-emerald-300 font-mono truncate">
              {task.result}
            </p>
          </div>
        )}

        {task.status === 'failed' && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <p className="text-xs text-rose-300">Task processing failed</p>
          </div>
        )}

        {/* Footer: Date + View button */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Calendar className="w-3 h-3" />
            {formatDate(task.createdAt)}
          </div>
          <span className="flex items-center gap-1 text-[11px] text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View Details
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
