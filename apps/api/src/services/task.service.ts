import { randomUUID } from 'node:crypto';
import { db } from '../auth';
import { UserRole, type Task, type CreateTaskPayload, type UpdateTaskPayload } from '@snake/types';

export const mapRowToTask = (databaseRow: any): Task => ({
  id: databaseRow.id,
  title: databaseRow.title,
  description: databaseRow.description || '',
  completed: Boolean(databaseRow.completed),
  userId: databaseRow.userId,
  createdAt: databaseRow.createdAt,
});

export const getTasksForUser = async (userId: string, userRole: string = UserRole.User): Promise<Task[]> => {
  const taskRows = await db.selectFrom('task').selectAll().where('userId', '=', userId).execute();
  let userTasks = taskRows.map(mapRowToTask);

  // If user has no tasks yet, seed initial default tasks in a single batch insert
  if (userTasks.length === 0) {
    const defaultTasks: Task[] = [
      {
        id: randomUUID(),
        title: 'Welcome to your Task Dashboard',
        description: 'This is your private task list. Add, edit or complete your items.',
        completed: false,
        userId: userId,
        createdAt: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        title: 'Explore User Roles',
        description: `Your account role is '${userRole}'.`,
        completed: true,
        userId: userId,
        createdAt: new Date().toISOString(),
      },
    ];

    await db
      .insertInto('task')
      .values(
        defaultTasks.map((taskItem) => ({
          id: taskItem.id,
          title: taskItem.title,
          description: taskItem.description,
          completed: taskItem.completed ? 1 : 0,
          userId: taskItem.userId!,
          createdAt: taskItem.createdAt,
        }))
      )
      .execute();

    userTasks = defaultTasks;
  }

  return userTasks;
};

export const getTaskById = async (taskId: string): Promise<Task | null> => {
  const databaseRow = await db.selectFrom('task').selectAll().where('id', '=', taskId).executeTakeFirst();
  if (!databaseRow) {
    return null;
  }
  return mapRowToTask(databaseRow);
};

export const createTask = async (userId: string, payload: CreateTaskPayload): Promise<Task> => {
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

export const updateTask = async (existingTask: Task, payload: UpdateTaskPayload): Promise<Task> => {
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

export const deleteTask = async (taskId: string): Promise<void> => {
  await db.deleteFrom('task').where('id', '=', taskId).execute();
};
