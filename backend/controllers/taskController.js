import Task from '../models/Task.js';
import taskQueue from '../queues/taskQueue.js';

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private (JWT required)
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, inputText, operation } = req.body;

    // Validate required fields
    if (!title || !inputText || !operation) {
      res.status(400);
      return next(new Error('Please provide title, inputText, and operation'));
    }

    // Validate operation against allowed values
    const allowedOperations = ['uppercase', 'lowercase', 'reverse', 'word_count'];
    if (!allowedOperations.includes(operation)) {
      res.status(400);
      return next(
        new Error(`Invalid operation. Allowed: ${allowedOperations.join(', ')}`)
      );
    }

    // Step 1: Create task document in MongoDB
    const task = await Task.create({
      userId: req.user._id,
      title,
      inputText,
      operation,
      status: 'pending',
      result: '',
      logs: [],
    });

    // Step 2: Push job into Redis queue for future processing
    try {
      await taskQueue.add('process-task', {
        taskId: task._id,
        inputText: task.inputText,
        operation: task.operation,
      });

      console.log(`📤 Task ${task._id} added to queue "task-processing"`);
    } catch (queueError) {
      // Task is saved in MongoDB but failed to enqueue — log and warn
      console.error(`❌ Failed to enqueue task ${task._id}:`, queueError.message);
    }

    // Step 3: Return success response with created task summary
    res.status(201).json({
      message: 'Task created and queued successfully',
      task: {
        _id: task._id,
        title: task.title,
        operation: task.operation,
        status: task.status,
        createdAt: task.createdAt,
      },
    });
  } catch (error) {
    // Handle Mongoose validation errors with a 400 status
    if (error.name === 'ValidationError') {
      res.status(400);
      return next(new Error(error.message));
    }
    next(error);
  }
};

/**
 * @desc    Get all tasks for the logged-in user
 * @route   GET /api/tasks
 * @access  Private (JWT required)
 */
export const getTasks = async (req, res, next) => {
  try {
    // Fetch only the authenticated user's tasks, newest first
    const tasks = await Task.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private (JWT required)
 */
export const getTaskById = async (req, res, next) => {
  try {
    // Find the task and ensure it belongs to the logged-in user
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      res.status(404);
      return next(new Error('Task not found'));
    }

    res.status(200).json({ task });
  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.kind === 'ObjectId') {
      res.status(400);
      return next(new Error('Invalid task ID format'));
    }
    next(error);
  }
};
