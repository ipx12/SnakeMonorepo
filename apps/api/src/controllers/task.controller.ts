import { Context } from 'hono';
import { UserRole } from '@snake/types';
import type { UserSession } from '../middlewares/auth.middleware';
import * as taskService from '../services/task.service';

export const getTasksHandler = async (c: Context) => {
  const session = c.get('userSession') as UserSession;
  const userId = session.user.id;
  const userRole = (session.user as { role?: string }).role || UserRole.User;
  try {
    const userTasks = await taskService.getTasksForUser(userId, userRole);
    return c.json(userTasks);
  } catch (caughtError: any) {
    return c.json({ message: 'Failed to fetch tasks', error: caughtError.message }, 500);
  }
};

export const getTaskByIdHandler = async (c: Context) => {
  const taskId = c.req.param('id');
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
  } catch (caughtError: any) {
    return c.json({ message: 'Failed to fetch task', error: caughtError.message }, 500);
  }
};

export const createTaskHandler = async (c: Context) => {
  const session = c.get('userSession') as UserSession;
  const currentUserId = session.user.id;
  const body = c.req.valid('json' as never); // Types handled by zValidator on the route
  
  try {
    const createdTask = await taskService.createTask(currentUserId, body as any);
    return c.json(createdTask, 201);
  } catch (caughtError: any) {
    return c.json({ message: 'Failed to create task', error: caughtError.message }, 500);
  }
};

export const updateTaskHandler = async (c: Context) => {
  const taskId = c.req.param('id');
  const body = c.req.valid('json' as never);
  
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

    const updatedTask = await taskService.updateTask(existingTask, body as any);
    return c.json(updatedTask);
  } catch (caughtError: any) {
    return c.json({ message: 'Failed to update task', error: caughtError.message }, 500);
  }
};

export const deleteTaskHandler = async (c: Context) => {
  const taskId = c.req.param('id');
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
  } catch (caughtError: any) {
    return c.json({ message: 'Failed to delete task', error: caughtError.message }, 500);
  }
};
