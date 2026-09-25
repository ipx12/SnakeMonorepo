import { randomUUID } from 'node:crypto';
import type { Selectable } from 'kysely';
import { db } from '../auth';
import {
  UserRole,
  type Task,
  type CreateTaskPayload,
  type UpdateTaskPayload,
  type TaskTable,
} from '@snake/types';

export type RawTaskRow = Selectable<TaskTable> | TaskTable;

/**
 * Maps a raw database row from the `task` table to the strongly-typed domain Task entity.
 *
 * @param databaseRow - Database row containing raw fields (with numeric boolean representation)
 * @returns Mapped domain Task entity with boolean completed state
 */
export const mapRowToTask = (databaseRow: RawTaskRow): Task => ({
  id: databaseRow.id,
  title: databaseRow.title,
  description: databaseRow.description || '',
  completed: Boolean(databaseRow.completed),
  userId: databaseRow.userId,
  createdAt: databaseRow.createdAt,
});

/**
 * Retrieves all tasks belonging to a specific user.
 *
 * @param userId - Unique identifier of the authenticated user
 * @param userRole - Role of the requesting user (defaults to UserRole.User)
 * @returns Array of tasks owned by the specified user
 */
export const getTasksForUser = async (
  userId: string,
  userRole: string = UserRole.User
): Promise<Task[]> => {
  const taskRows = await db
    .selectFrom('task')
    .selectAll()
    .where('userId', '=', userId)
    .execute();
  return taskRows.map(mapRowToTask);
};

/**
 * Retrieves a single task by its unique identifier.
 *
 * @param taskId - Unique identifier of the task
 * @returns The found Task domain model or null if not found
 */
export const getTaskById = async (taskId: string): Promise<Task | null> => {
  const databaseRow = await db
    .selectFrom('task')
    .selectAll()
    .where('id', '=', taskId)
    .executeTakeFirst();

  if (!databaseRow) {
    return null;
  }
  return mapRowToTask(databaseRow);
};

/**
 * Creates and persists a new task in the database for the given user.
 *
 * @param userId - Unique identifier of the author
 * @param payload - Task creation data (`title`, optional `description`)
 * @returns The newly created and persisted Task model
 */
export const createTask = async (
  userId: string,
  payload: CreateTaskPayload
): Promise<Task> => {
  const newTask: Task = {
    id: randomUUID(),
    title: payload.title,
    description: payload.description || '',
    completed: false,
    userId: userId,
    createdAt: new Date().toISOString(),
  };

  await db
    .insertInto('task')
    .values({
      id: newTask.id,
      title: newTask.title,
      description: newTask.description,
      completed: 0,
      userId: newTask.userId!,
      createdAt: newTask.createdAt,
    })
    .execute();

  return newTask;
};

/**
 * Updates existing task fields and persists changes to the database.
 *
 * @param existingTask - The current Task entity prior to modification
 * @param payload - Fields to update (`title`, `description`, `completed`)
 * @returns Updated Task entity
 */
export const updateTask = async (
  existingTask: Task,
  payload: UpdateTaskPayload
): Promise<Task> => {
  const updatedTask: Task = {
    ...existingTask,
    title: payload.title !== undefined ? payload.title : existingTask.title,
    description: payload.description !== undefined ? payload.description : existingTask.description,
    completed: payload.completed !== undefined ? payload.completed : existingTask.completed,
  };

  await db
    .updateTable('task')
    .set({
      title: updatedTask.title,
      description: updatedTask.description,
      completed: updatedTask.completed ? 1 : 0,
    })
    .where('id', '=', existingTask.id)
    .execute();

  return updatedTask;
};

/**
 * Permanently removes a task from the database by ID.
 *
 * @param taskId - Unique identifier of the task to delete
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  await db.deleteFrom('task').where('id', '=', taskId).execute();
};
