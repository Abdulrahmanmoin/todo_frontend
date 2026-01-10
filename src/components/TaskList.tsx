'use client';

import React, { useState } from 'react';
import { Task } from '@/types/task';
import { api } from '@/lib/api';

interface TaskListProps {
  userId: string;
  tasks: Task[];
  loading?: boolean;
  onTaskUpdate?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskFormToggle?: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  userId,
  tasks,
  loading = false,
  onTaskUpdate,
  onTaskEdit,
  onTaskDelete,
  onTaskFormToggle
}) => {
  const [error, setError] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Toggle task completion status
  const toggleTaskCompletion = async (taskId: string) => {
    try {
      const taskToToggle = tasks.find(task => task.task_id === taskId);
      if (!taskToToggle) return;

      // Update completion status via API
      const updatedTask = await api.patch<Partial<Task>, Task>(`/api/${userId}/tasks/${taskId}`, {
        is_completed: !taskToToggle.is_completed
      });

      // Local update is handled by the parent through onTaskUpdate
      if (onTaskUpdate) {
        onTaskUpdate(updatedTask);
      }
    } catch (err) {
      console.error('Error updating task completion:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while updating task');
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    try {
      // Delete task via API
      await api.delete(`/api/${userId}/tasks/${taskId}`);

      // Local update is handled by the parent through onTaskDelete
      if (onTaskDelete) {
        onTaskDelete(taskId);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while deleting task');
    }
  };

  const handleToggleComplete = (taskId: string) => {
    toggleTaskCompletion(taskId);
  };

  const handleEditClick = (task: Task) => {
    if (onTaskFormToggle) {
      onTaskFormToggle(task);
    } else if (onTaskEdit) {
      onTaskEdit(task);
    } else {
      setEditingTaskId(task.task_id);
      setEditText(task.title);
    }
  };

  const handleSaveEdit = () => {
    if (editingTaskId) {
      setEditingTaskId(null);
      // Actual update should happen via parent
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditText('');
  };

  if (loading) {
    return (
      <div className="task-list">
        <h2 className="text-xl font-semibold mb-4">Tasks</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="task-list">
      <h2 className="text-xl font-semibold mb-4">Tasks</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks available</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map(task => (
            <li
              key={task.task_id}
              className={`flex items-center justify-between p-3 border rounded-lg ${task.is_completed ? 'bg-green-50' : 'bg-white'
                }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={task.is_completed}
                  onChange={() => handleToggleComplete(task.task_id)}
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  aria-label={`Mark task "${task.title}" as ${task.is_completed ? 'incomplete' : 'complete'}`}
                />
                <div>
                  {editingTaskId === task.task_id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="border rounded px-2 py-1"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                        aria-label="Save task"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                        aria-label="Cancel edit"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span
                        className={`${task.is_completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
                      >
                        {task.title}
                      </span>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                {editingTaskId !== task.task_id && (
                  <button
                    onClick={() => handleEditClick(task)}
                    className="text-blue-500 hover:text-blue-700"
                    aria-label={`Edit task "${task.title}"`}
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => deleteTask(task.task_id)}
                  className="text-red-500 hover:text-red-700"
                  aria-label={`Delete task "${task.title}"`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;