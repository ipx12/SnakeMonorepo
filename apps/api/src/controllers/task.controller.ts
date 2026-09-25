import { Context } from 'hono';
import {
  UserRole,
  type CreateTaskPayload,
  type UpdateTaskPayload,
} from '@snake/types';
import type { UserSession } from '../middlewares/auth.middleware';
import * as taskService from '../services/task.service';

/**
 * Controller handler returning all tasks belonging to the authenticated user.
 */
export const getTasksHandler = async (c: Context) => {
  const session = c.get('userSession') as UserSession;
  const userId = session.user.id;
  const userRole = (session.user as { role?: string }).role || UserRole.User;
  try {
    const userTasks = await taskService.getTasksForUser(userId, userRole);
    return c.json(userTasks);
  } catch (caughtError: unknown) {
    const errorMessage = caughtError instanceof Error ? caughtError.message : 'Unknown server error';
    return c.json({ message: 'Failed to fetch tasks', error: errorMessage }, 500);
  }
};

/**
 * Controller handler retrieving a single task by ID with ownership verification.
 */
export const getTaskByIdHandler = async (c: Context) => {
  const taskId = c.req.param('id');
  if (!taskId) {
    return c.json({ message: 'Task ID is required' }, 400);
  }
  try {
    const foundTask = await taskService.getTaskById(taskId);
    if (!foundTask) {
      return c.json({ message: 'Task not found' }, 404);
    }

    const session = c.get('userSession') as UserSession;
    const currentUserId = session.user.id;
    const userRole = (session.user as { role?: string }).role;

    if (foundTask.userId !== currentUserId && userRole !== UserRole.Admin) {
      return c.json({ message: 'Forbidden' }, 403);
    }

    return c.json(foundTask);
  } catch (caughtError: unknown) {
    const errorMessage = caughtError instanceof Error ? caughtError.message : 'Unknown server error';
    return c.json({ message: 'Failed to fetch task', error: errorMessage }, 500);
  }
};

/**
 * Controller handler creating a new task from validated request body.
 */
export const createTaskHandler = async (c: Context) => {
  const session = c.get('userSession') as UserSession;
  const currentUserId = session.user.id;
  const body = c.req.valid('json' as never) as CreateTaskPayload;

  try {
    const createdTask = await taskService.createTask(currentUserId, body);
    return c.json(createdTask, 201);
  } catch (caughtError: unknown) {
    const errorMessage = caughtError instanceof Error ? caughtError.message : 'Unknown server error';
    return c.json({ message: 'Failed to create task', error: errorMessage }, 500);
  }
};

/**
 * Controller handler updating task fields with ownership and admin verification.
 */
export const updateTaskHandler = async (c: Context) => {
  const taskId = c.req.param('id');
  if (!taskId) {
    return c.json({ message: 'Task ID is required' }, 400);
  }
  const body = c.req.valid('json' as never) as UpdateTaskPayload;

  try {
    const existingTask = await taskService.getTaskById(taskId);
    if (!existingTask) {
      return c.json({ message: 'Task not found' }, 404);
    }

    const session = c.get('userSession') as UserSession;
    const currentUserId = session.user.id;
    const userRole = (session.user as { role?: string }).role;

    if (existingTask.userId !== currentUserId && userRole !== UserRole.Admin) {
      return c.json({ message: 'Forbidden' }, 403);
    }

    const updatedTask = await taskService.updateTask(existingTask, body);
    return c.json(updatedTask);
  } catch (caughtError: unknown) {
    const errorMessage = caughtError instanceof Error ? caughtError.message : 'Unknown server error';
    return c.json({ message: 'Failed to update task', error: errorMessage }, 500);
  }
};

/**
 * Controller handler deleting a task by ID with ownership verification.
 */
export const deleteTaskHandler = async (c: Context) => {
  const taskId = c.req.param('id');
  if (!taskId) {
    return c.json({ message: 'Task ID is required' }, 400);
  }
  try {
    const existingTask = await taskService.getTaskById(taskId);
    if (!existingTask) {
      return c.json({ message: 'Task not found' }, 404);
    }

    const session = c.get('userSession') as UserSession;
    const currentUserId = session.user.id;
    const userRole = (session.user as { role?: string }).role;

    if (existingTask.userId !== currentUserId && userRole !== UserRole.Admin) {
      return c.json({ message: 'Forbidden' }, 403);
    }

    await taskService.deleteTask(taskId);
    return c.json(existingTask);
  } catch (caughtError: unknown) {
    const errorMessage = caughtError instanceof Error ? caughtError.message : 'Unknown server error';
    return c.json({ message: 'Failed to delete task', error: errorMessage }, 500);
  }
};
