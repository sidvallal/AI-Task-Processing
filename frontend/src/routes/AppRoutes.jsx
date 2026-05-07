import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProtectedRoute from '../components/ProtectedRoute';
import useAuth from '../hooks/useAuth';

// A simple dashboard component for demonstration
const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto glass-dark rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-4">Dashboard</h1>
        <p className="text-slate-300 mb-8">
          Welcome back, <span className="text-primary-400 font-semibold">{currentUser?.name}</span>!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Mock dashboard cards */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-2">Task Module {i}</h3>
              <p className="text-sm text-slate-400">Processing ready...</p>
            </div>
          ))}
        </div>

        <button
          onClick={logout}
          className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
