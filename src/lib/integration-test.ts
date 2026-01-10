// Simple test to verify the integration of components
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import { api } from '@/lib/api';
import { Task } from '@/types/task';

// Mock auth token to test API calls
const TEST_AUTH_TOKEN = 'test-token';

// Set up the auth token in localStorage for testing
localStorage.setItem('authToken', TEST_AUTH_TOKEN);

// Mock user ID for testing
const TEST_USER_ID = 'test-user-id';

// Test fetching tasks
async function testFetchTasks() {
  try {
    console.log('Testing fetch tasks...');
    const tasks = await api.get<Task[]>(`/api/${TEST_USER_ID}/tasks`);
    console.log('Fetched tasks:', tasks);
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

// Test creating a task
async function testCreateTask() {
  try {
    console.log('Testing create task...');
    const newTaskData = {
      title: 'Test Task',
      description: 'This is a test task'
    };

    const newTask = await api.post<any, Task>(`/api/${TEST_USER_ID}/tasks`, newTaskData);
    console.log('Created task:', newTask);
    return newTask;
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
}

// Test updating a task
async function testUpdateTask(taskId: string) {
  try {
    console.log('Testing update task...');
    const updateData = {
      title: 'Updated Test Task',
      is_completed: true
    };

    const updatedTask = await api.put<any, Task>(`/api/${TEST_USER_ID}/tasks/${taskId}`, updateData);
    console.log('Updated task:', updatedTask);
    return updatedTask;
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
}

// Test deleting a task
async function testDeleteTask(taskId: string) {
  try {
    console.log('Testing delete task...');
    await api.delete(`/api/${TEST_USER_ID}/tasks/${taskId}`);
    console.log('Deleted task:', taskId);
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}

// Run integration tests
async function runIntegrationTests() {
  console.log('Starting frontend-backend integration tests...');

  // Test create
  const createdTask = await testCreateTask();
  if (createdTask) {
    console.log('✓ Task creation successful');

    // Test update
    if (createdTask.task_id) {
      const updatedTask = await testUpdateTask(createdTask.task_id);
      if (updatedTask) {
        console.log('✓ Task update successful');

        // Test delete
        const deleted = await testDeleteTask(createdTask.task_id);
        if (deleted) {
          console.log('✓ Task deletion successful');
          console.log('✓ All integration tests passed!');
        } else {
          console.log('✗ Task deletion failed');
        }
      } else {
        console.log('✗ Task update failed');
      }
    }
  } else {
    console.log('✗ Task creation failed');
  }

  // Test fetch
  await testFetchTasks();
  console.log('Integration test completed.');
}

// Export the test function
export { runIntegrationTests };

// If running directly, execute the tests
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).runIntegrationTests = runIntegrationTests;
} else if (typeof global !== 'undefined') {
  // Node.js environment
  (global as any).runIntegrationTests = runIntegrationTests;
}