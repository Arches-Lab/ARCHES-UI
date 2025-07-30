# API Structure

This directory contains organized API functions for different features of the application.

## Files

### `index.ts`
Main API configuration and shared functions:
- Axios instance configuration
- Request/response interceptors
- Token and store management
- Shared API functions (employees, messages, leads, activities, mailboxes)

### `tasks.ts`
Task-related API functions:
- `getTasks()` - Fetch all tasks
- `getTask(taskId)` - Fetch a specific task
- `createTask(taskData)` - Create a new task
- `updateTask(taskId, taskData)` - Update an existing task
- `getActivitiesForTask(taskId)` - Fetch activities for a specific task

## Usage

Import API functions from the main index file:

```typescript
import { getTasks, getTask, createTask, updateTask, getEmployees } from '../api';
```

Or import directly from specific files:

```typescript
import { getTasks, getTask } from '../api/tasks';
import { getEmployees } from '../api';
```

## Benefits

- **Organized code** - Related functions are grouped together
- **Better maintainability** - Easier to find and update specific API functions
- **Scalability** - Easy to add new feature-specific API files
- **Clear separation** - Each file has a specific responsibility 