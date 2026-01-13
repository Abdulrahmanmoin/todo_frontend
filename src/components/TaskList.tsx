'use client';

import React, { useState } from 'react';
import { Task, UpdateTaskRequest } from '@/types/task';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';

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
    const taskToToggle = tasks.find(task => task.task_id === taskId);
    if (!taskToToggle) return;

    // 1. Optimistic Update
    const optimisticTask = { ...taskToToggle, is_completed: !taskToToggle.is_completed };
    if (onTaskUpdate) {
      onTaskUpdate(optimisticTask);
    }

    try {
      // 2. API Call
      // Update completion status via API
      const updatedTask = await api.put<UpdateTaskRequest, Task>(`/api/${userId}/tasks/${taskId}`, {
        is_completed: optimisticTask.is_completed
      });

      // Sync with server response
      if (onTaskUpdate) {
        onTaskUpdate(updatedTask);
      }
    } catch (err) {
      console.error('Error updating task completion:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while updating task');

      // 3. Revert on failure
      if (onTaskUpdate) {
        onTaskUpdate(taskToToggle);
      }
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
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Tasks</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="task-list">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Tasks</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {tasks.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400 text-lg">No tasks available</p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Add your first task to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence>
          <ul className="space-y-3">
            {tasks.map((task, index) => (
              <motion.li
                key={task.task_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group"
              >
                <Card className={`p-4 transition-all duration-300 ${task.is_completed
                  ? 'bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-white dark:bg-gray-800 hover:shadow-md'
                  }`}>
                  <CardContent className="p-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <Checkbox
                          checked={task.is_completed}
                          onCheckedChange={() => handleToggleComplete(task.task_id)}
                          className="mt-1 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                          aria-label={`Mark task "${task.title}" as ${task.is_completed ? 'incomplete' : 'complete'}`}
                        />
                        <div className="flex-1 min-w-0">
                          {editingTaskId === task.task_id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="border rounded px-2 py-1 flex-1 min-w-0"
                                autoFocus
                              />
                              <Button
                                onClick={handleSaveEdit}
                                size="sm"
                                variant="default"
                              >
                                Save
                              </Button>
                              <Button
                                onClick={handleCancelEdit}
                                size="sm"
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <p
                                className={`break-words ${task.is_completed
                                  ? 'line-through text-gray-500 dark:text-gray-400'
                                  : 'text-gray-800 dark:text-gray-200'
                                  }`}
                              >
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        {editingTaskId !== task.task_id && (
                          <Button
                            onClick={() => handleEditClick(task)}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                        )}
                        <Button
                          onClick={() => deleteTask(task.task_id)}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.li>
            ))}
          </ul>
        </AnimatePresence>
      )}
    </div>
  );
};

export default TaskList;