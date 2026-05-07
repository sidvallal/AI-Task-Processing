import mongoose from 'mongoose';

/**
 * Task Schema
 * Represents a text-processing task created by an authenticated user.
 * Each task stores the input text, the desired operation, and tracks
 * its processing status, result, and logs.
 */
const taskSchema = mongoose.Schema(
  {
    // Reference to the user who created this task
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },

    // Human-readable title for the task
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    // The raw text input to be processed
    inputText: {
      type: String,
      required: [true, 'Please add input text'],
    },

    // The text operation to perform on inputText
    operation: {
      type: String,
      required: [true, 'Please select an operation'],
      enum: {
        values: ['uppercase', 'lowercase', 'reverse', 'word_count'],
        message: '{VALUE} is not a supported operation',
      },
    },

    // Current processing status of the task
    status: {
      type: String,
      enum: {
        values: ['pending', 'running', 'success', 'failed'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },

    // The output produced after processing (empty until complete)
    result: {
      type: String,
      default: '',
    },

    // Processing logs for debugging and tracking progress
    logs: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Index for efficient querying of tasks by user, sorted by creation date
taskSchema.index({ userId: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
