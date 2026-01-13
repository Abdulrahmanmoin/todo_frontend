'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types/task';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-4 sm:p-6"
    >
      <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
            Task Manager
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your tasks efficiently
          </p>
        </CardHeader>
      </Card>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Your Tasks</h2>
            <Button
              onClick={() => {
                setEditingTask(null);
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              Add New Task
            </Button>
          </div>

          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskForm
                    userId={user?.user_id || ''}
                    task={editingTask}
                    onSubmit={handleSubmitTask}
                    onCancel={handleCancelForm}
                  />
                </CardContent>
              </Card>
            </motion.div>
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
        </CardContent>
      </Card>
    </motion.div>
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