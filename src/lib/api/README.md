# API Utility Functions

This module provides a comprehensive set of utility functions for making authenticated API requests to the backend service. It includes proper error handling, TypeScript typing, and organized endpoints for different resources.

## Features

- **Base Configuration**: Proper URL handling with fallback to localhost
- **Authentication**: Automatic token handling from localStorage
- **Typed Requests**: Full TypeScript support for all API calls
- **Error Handling**: Custom `ApiError` class with status codes and data
- **Multiple HTTP Methods**: GET, POST, PUT, PATCH, DELETE
- **Resource-Specific APIs**: Organized endpoints for tasks, users, and auth

## Usage

### Basic API Calls

```typescript
import { api } from '../lib/api';

// GET request
const tasks = await api.get<Task[]>('/tasks');

// POST request
const newTask = await api.post('/tasks', {
  title: 'New task',
  description: 'Task description',
  status: 'pending'
});

// PUT request
const updatedTask = await api.put(`/tasks/${taskId}`, {
  title: 'Updated task title'
});

// DELETE request
await api.delete(`/tasks/${taskId}`);
```

### Using Resource-Specific APIs

```typescript
import { api } from '../lib/api';

// Task operations
const tasks = await api.task.getAll();
const task = await api.task.getById('task-id');
const createdTask = await api.task.create(taskData);
const updatedTask = await api.task.update('task-id', updateData);
await api.task.delete('task-id');

// User operations
const currentUser = await api.user.getCurrentUser();
const updatedUser = await api.user.updateProfile(userData);

// Authentication
const loginResult = await api.auth.login(credentials);
const registerResult = await api.auth.register(userData);
api.auth.logout();
const isTokenValid = await api.auth.verifyToken();
```

### Error Handling

```typescript
import { api, ApiError } from '../lib/api';

try {
  const tasks = await api.get<Task[]>('/tasks');
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error: ${error.status} - ${error.message}`);
    // Handle specific API errors
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Base URL for API requests (defaults to `http://localhost:8000/api`)

## API Structure

The API utility provides three main namespaces:

- `api.task` - Task-related endpoints
- `api.user` - User-related endpoints
- `api.auth` - Authentication endpoints

Each namespace contains methods that correspond to RESTful operations for the respective resources.