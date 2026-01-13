'use client';

import React, { useState, useEffect } from 'react';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types/task';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface TaskFormProps {
  userId: string;
  task?: Task | null;
  onSubmit?: (task: Task) => void;
  onCancel?: () => void;
}

interface FormState {
  title: string;
  description: string;
  errors: {
    title?: string;
    description?: string;
  };
  loading: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ userId, task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<FormState>({
    title: '',
    description: '',
    errors: {},
    loading: false,
  });

  useEffect(() => {
    if (task) {
      setFormData(prev => ({
        ...prev,
        title: task.title || '',
        description: task.description || '',
        errors: {},
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        title: '',
        description: '',
        errors: {},
      }));
    }
  }, [task]);

  const validateForm = (): boolean => {
    const errors: FormState['errors'] = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length > 200) {
      errors.title = 'Title must be 200 characters or less';
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must be 500 characters or less';
    }

    setFormData(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      errors: {
        ...prev.errors,
        [name]: undefined, // Clear error when user starts typing
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || formData.loading) {
      return;
    }

    setFormData(prev => ({ ...prev, loading: true }));

    try {
      if (task) {
        // Update existing task
        const updateData: UpdateTaskRequest = {};
        if (formData.title !== task.title) updateData.title = formData.title.trim();
        if (formData.description !== task.description) updateData.description = formData.description.trim();

        const updatedTask = await api.put<UpdateTaskRequest, Task>(`/api/${userId}/tasks/${task.task_id}`, updateData);

        if (onSubmit) {
          onSubmit(updatedTask);
        }
      } else {
        // Create new task
        const createData: CreateTaskRequest = {
          title: formData.title.trim(),
          description: formData.description.trim(),
        };

        const newTask = await api.post<CreateTaskRequest, Task>(`/api/${userId}/tasks`, createData);

        if (onSubmit) {
          onSubmit(newTask);
        }
      }
    } catch (err) {
      console.error(task ? 'Error updating task:' : 'Error creating task:', err);
      let errorMessage = 'An unknown error occurred';

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setFormData(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          title: errorMessage
        }
      }));
    } finally {
      setFormData(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Title *
        </Label>
        <Input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          disabled={formData.loading}
          placeholder="Enter task title"
          className={`${formData.errors.title ? 'border-red-500' : ''} ${formData.loading ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          aria-invalid={!!formData.errors.title}
          aria-describedby={formData.errors.title ? 'title-error' : undefined}
        />
        {formData.errors.title && (
          <p id="title-error" className="text-sm text-red-500">
            {formData.errors.title}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          disabled={formData.loading}
          placeholder="Enter task description (optional)"
          rows={4}
          className={`${formData.errors.description ? 'border-red-500' : ''} ${formData.loading ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          aria-invalid={!!formData.errors.description}
          aria-describedby={formData.errors.description ? 'description-error' : undefined}
        />
        {formData.errors.description && (
          <p id="description-error" className="text-sm text-red-500">
            {formData.errors.description}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <Button
          type="button"
          onClick={handleCancel}
          disabled={formData.loading}
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={formData.loading}
          className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
        >
          {formData.loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {task ? 'Updating...' : 'Creating...'}
            </div>
          ) : (
            task ? 'Update Task' : 'Create Task'
          )}
        </Button>
      </div>
    </motion.form>
  );
};

export default TaskForm;