'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types/task';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';

const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchTasks = async () => {
    if (!user?.user_id) return;
    try {
      setLoading(true);
      setError(null);
      const userTasks = await api.get<Task[]>(`/api/${user.user_id}/tasks`);
      setTasks(userTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user?.user_id]);

  // Handle task operations
  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.task_id === updatedTask.task_id ? updatedTask : t));
    console.log('Task updated:', updatedTask);
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.task_id !== taskId));
    console.log('Task deleted:', taskId);
  };

  // Handle form submission (both create and update)
  const handleSubmitTask = (task: Task) => {
    if (editingTask) {
      // Update existing task
      handleTaskUpdate(task);
    } else {
      // Add new task
      setTasks(prev => [task, ...prev]);
    }
    setShowForm(false);
    setEditingTask(null);
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setEditingTask(null);
    setShowForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Manager</h1>
        <p className="text-gray-600">Manage your tasks efficiently</p>
      </div>

      {(error) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Your Tasks</h2>
          <button
            onClick={() => {
              setEditingTask(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Add New Task
          </button>
        </div>

        {showForm && (
          <div className="mb-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h3>
            <TaskForm
              userId={user?.user_id || ''}
              task={editingTask}
              onSubmit={handleSubmitTask}
              onCancel={handleCancelForm}
            />
          </div>
        )}
        <TaskList
          userId={user?.user_id || ''}
          tasks={tasks}
          loading={loading}
          onTaskUpdate={handleTaskUpdate}
          onTaskEdit={handleTaskEdit}
          onTaskDelete={handleTaskDelete}
          onTaskFormToggle={handleTaskEdit}
        />
      </div>
    </div>
  );
};

// Wrap the component with ProtectedRoute to ensure authentication
const ProtectedTasksPage: React.FC = () => {
  return (
    <ProtectedRoute requireAuth={true} fallbackPath="/login">
      <TasksPage />
    </ProtectedRoute>
  );
};

export default ProtectedTasksPage;