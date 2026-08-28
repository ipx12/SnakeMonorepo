import type { Response } from 'express';
import { UserRole } from '@snake/types';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as taskService from '../services/task.service';

export const getTasksHandler = async (httpRequest: AuthenticatedRequest, httpResponse: Response) => {
  const userId = httpRequest.userSession!.user.id;
  const userRole = (httpRequest.userSession!.user as { role?: string }).role || UserRole.User;
  try {
    const userTasks = await taskService.getTasksForUser(userId, userRole);
    httpResponse.json(userTasks);
  } catch (caughtError: any) {
    httpResponse.status(500).json({ message: 'Failed to fetch tasks', error: caughtError.message });
  }
};

export const getTaskByIdHandler = async (httpRequest: AuthenticatedRequest, httpResponse: Response) => {
  const taskId = httpRequest.params.id;
  try {
    const foundTask = await taskService.getTaskById(taskId);
    if (!foundTask) {
      return httpResponse.status(404).json({ message: 'Task not found' });
    }

    const currentUserId = httpRequest.userSession!.user.id;
    const userRole = (httpRequest.userSession!.user as { role?: string }).role;
    if (foundTask.userId !== currentUserId && userRole !== UserRole.Admin) {
      return httpResponse.status(403).json({ message: 'Forbidden' });
    }

    httpResponse.json(foundTask);
  } catch (caughtError: any) {
    httpResponse.status(500).json({ message: 'Failed to fetch task', error: caughtError.message });
  }
};

export const createTaskHandler = async (httpRequest: AuthenticatedRequest, httpResponse: Response) => {
  const currentUserId = httpRequest.userSession!.user.id;
  try {
    const createdTask = await taskService.createTask(currentUserId, httpRequest.body);
    httpResponse.status(201).json(createdTask);
  } catch (caughtError: any) {
    httpResponse.status(500).json({ message: 'Failed to create task', error: caughtError.message });
  }
};

export const updateTaskHandler = async (httpRequest: AuthenticatedRequest, httpResponse: Response) => {
  const taskId = httpRequest.params.id;
  try {
    const existingTask = await taskService.getTaskById(taskId);
    if (!existingTask) {
      return httpResponse.status(404).json({ message: 'Task not found' });
    }

    const currentUserId = httpRequest.userSession!.user.id;
    const userRole = (httpRequest.userSession!.user as { role?: string }).role;
    if (existingTask.userId !== currentUserId && userRole !== UserRole.Admin) {
      return httpResponse.status(403).json({ message: 'Forbidden' });
    }

    const updatedTask = await taskService.updateTask(existingTask, httpRequest.body);
    httpResponse.json(updatedTask);
  } catch (caughtError: any) {
    httpResponse.status(500).json({ message: 'Failed to update task', error: caughtError.message });
  }
};

export const deleteTaskHandler = async (httpRequest: AuthenticatedRequest, httpResponse: Response) => {
  const taskId = httpRequest.params.id;
  try {
    const existingTask = await taskService.getTaskById(taskId);
    if (!existingTask) {
      return httpResponse.status(404).json({ message: 'Task not found' });
    }

    const currentUserId = httpRequest.userSession!.user.id;
    const userRole = (httpRequest.userSession!.user as { role?: string }).role;
    if (existingTask.userId !== currentUserId && userRole !== UserRole.Admin) {
      return httpResponse.status(403).json({ message: 'Forbidden' });
    }

    await taskService.deleteTask(taskId);
    httpResponse.json(existingTask);
  } catch (caughtError: any) {
    httpResponse.status(500).json({ message: 'Failed to delete task', error: caughtError.message });
  }
};
