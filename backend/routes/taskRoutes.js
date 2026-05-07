import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createTask,
  getTasks,
  getTaskById,
} from '../controllers/taskController.js';

const router = express.Router();

/**
 * Task Routes
 * All routes are protected — user must supply a valid JWT Bearer token.
 *
 * POST   /api/tasks      → Create a new task
 * GET    /api/tasks       → Get all tasks for the logged-in user
 * GET    /api/tasks/:id   → Get a single task by its ID
 */

// Apply JWT auth middleware to every route in this router
router.use(protect);

// POST /api/tasks  — Create a new task
router.post('/', createTask);

// GET /api/tasks  — List all tasks for the authenticated user
router.get('/', getTasks);

// GET /api/tasks/:id  — Get details of a specific task
router.get('/:id', getTaskById);

export default router;
