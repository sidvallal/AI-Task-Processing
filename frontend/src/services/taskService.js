import api from '../api/axios';

/**
 * Task Service
 * Centralized API layer for all task-related operations.
 * Uses the shared Axios instance which auto-attaches JWT tokens.
 */

/**
 * Create a new task
 * @param {Object} taskData - { title, inputText, operation }
 * @returns {Promise} API response with created task
 */
export const createTask = async (taskData) => {
  const { data } = await api.post('/tasks', taskData);
  return data;
};

/**
 * Get all tasks for the authenticated user
 * @returns {Promise} API response with tasks array and count
 */
export const getTasks = async () => {
  const { data } = await api.get('/tasks');
  return data;
};

/**
 * Get a single task by its ID
 * @param {string} taskId - MongoDB ObjectId of the task
 * @returns {Promise} API response with task details
 */
export const getTaskById = async (taskId) => {
  const { data } = await api.get(`/tasks/${taskId}`);
  return data;
};
