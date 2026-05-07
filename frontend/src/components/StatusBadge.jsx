import React from 'react';
import { Clock, Play, CheckCircle, XCircle } from 'lucide-react';

/**
 * StatusBadge Component
 * Renders a colored badge with icon based on task processing status.
 * Supports: pending (yellow), running (blue), success (green), failed (red)
 */

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400',
  },
  running: {
    label: 'Running',
    icon: Play,
    classes: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dot: 'bg-blue-400 animate-pulse',
  },
  success: {
    label: 'Success',
    icon: CheckCircle,
    classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    classes: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    dot: 'bg-rose-400',
  },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.classes} transition-all duration-300`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
