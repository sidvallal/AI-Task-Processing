import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  RefreshCw,
  LayoutGrid,
  List,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Activity,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import TaskForm from '../components/TaskForm';
import TaskTable from '../components/TaskTable';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { getTasks } from '../services/taskService';

/**
 * Dashboard Page
 * Main authenticated view. Displays task creation form, task list with
 * auto-refresh polling (every 5s), stats cards, and detail modal.
 */

/** Auto-refresh polling interval in milliseconds */
const POLL_INTERVAL = 5000;

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Fetch all tasks from the API.
   * @param {boolean} silent - If true, don't show loading spinner (for polling)
   */
  const fetchTasks = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getTasks();
      setTasks(data.tasks || []);
    } catch (error) {
      // Only show error toast on initial load, not during polling
      if (!silent) {
        const message =
          error.response?.data?.message || 'Failed to fetch tasks';
        toast.error(message);
      }
      // Handle expired JWT — redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /** Initial fetch on mount */
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * Auto-refresh polling every 5 seconds.
   * Silently fetches tasks without showing loading spinners.
   * Cleans up interval on unmount to prevent memory leaks.
   */
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchTasks(true);
    }, POLL_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchTasks]);

  /** Manual refresh handler with visual feedback */
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchTasks(true);
    setIsRefreshing(false);
    toast.success('Tasks refreshed');
  };

  /** Called by TaskForm after successful task creation */
  const handleTaskCreated = () => {
    fetchTasks(true);
  };

  /** Open the detail modal for a task */
  const handleViewDetails = (task) => {
    setSelectedTask(task);
  };

  /** Compute task stats for the summary cards */
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    running: tasks.filter((t) => t.status === 'running').length,
    success: tasks.filter((t) => t.status === 'success').length,
    failed: tasks.filter((t) => t.status === 'failed').length,
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-indigo-500/20 border border-primary-500/30">
              <LayoutDashboard className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-sm text-slate-500">
                Create and monitor your AI processing tasks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-refresh indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-400 font-medium">
                Live
              </span>
            </div>

            {/* Manual refresh button */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>

            {/* View mode toggle */}
            <div className="flex items-center rounded-lg bg-slate-800/60 border border-slate-700/50 p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            {
              label: 'Total Tasks',
              value: stats.total,
              icon: Activity,
              color: 'text-primary-400',
              bg: 'from-primary-500/10 to-primary-500/5',
              border: 'border-primary-500/20',
            },
            {
              label: 'Pending',
              value: stats.pending + stats.running,
              icon: Clock,
              color: 'text-amber-400',
              bg: 'from-amber-500/10 to-amber-500/5',
              border: 'border-amber-500/20',
            },
            {
              label: 'Completed',
              value: stats.success,
              icon: CheckCircle,
              color: 'text-emerald-400',
              bg: 'from-emerald-500/10 to-emerald-500/5',
              border: 'border-emerald-500/20',
            },
            {
              label: 'Failed',
              value: stats.failed,
              icon: XCircle,
              color: 'text-rose-400',
              bg: 'from-rose-500/10 to-rose-500/5',
              border: 'border-rose-500/20',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${stat.bg} border ${stat.border} p-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color} opacity-30`} />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid: Form + Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Task Creation Form */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <TaskForm onTaskCreated={handleTaskCreated} />
            </div>
          </div>

          {/* Tasks List */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                Your Tasks
                {loading && tasks.length > 0 && (
                  <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                )}
              </h2>
              <span className="text-xs text-slate-500">
                {stats.total} task{stats.total !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Table View */}
            {viewMode === 'table' && (
              <TaskTable
                tasks={tasks}
                loading={loading}
                onViewDetails={handleViewDetails}
              />
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <>
                {loading && tasks.length === 0 ? (
                  <div className="glass-dark rounded-2xl flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="glass-dark rounded-2xl flex flex-col items-center justify-center py-16 px-4">
                    <h3 className="text-lg font-semibold text-slate-300 mb-1">
                      No tasks yet
                    </h3>
                    <p className="text-sm text-slate-500 text-center max-w-xs">
                      Create your first task and it will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {tasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
