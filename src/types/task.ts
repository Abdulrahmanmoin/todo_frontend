import { UUID } from './user';

/**
 * Task interface for frontend application
 * Based on the data model with all required fields
 */
export interface Task {
  task_id: UUID;             // UUID string - Unique identifier for each task
  user_id: UUID;             // UUID string - Reference to the owning user
  title: string;             // Task title or description (required, max 200 chars)
  description: string;       // Detailed task description (optional)
  is_completed: boolean;     // Whether the task is completed (default: false)
  created_at: string;        // ISO date string - Timestamp when task was created
  updated_at: string;        // ISO date string - Timestamp when task was last updated
  completed_at: string | null; // ISO date string - Timestamp when task was marked as completed (nullable)
}

/**
 * Interface for creating a new task
 */
export interface CreateTaskRequest {
  title: string;             // Task title (required, max 200 chars)
  description?: string;      // Detailed task description (optional)
}

/**
 * Interface for updating an existing task
 */
export interface UpdateTaskRequest {
  title?: string;            // Task title (optional)
  description?: string;      // Detailed task description (optional)
  is_completed?: boolean;    // Whether the task is completed (optional)
}