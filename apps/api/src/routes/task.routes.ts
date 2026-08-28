import { Router } from 'express';
import { createTaskSchema, updateTaskSchema, taskIdParamSchema } from '@snake/types';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequestBody, validateRequestParams } from '../middlewares/validate.middleware';
import {
  getTasksHandler,
  getTaskByIdHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
} from '../controllers/task.controller';

const taskRouter = Router();

// All task routes require authentication
taskRouter.use(requireAuth);

taskRouter.get('/', getTasksHandler);
taskRouter.get('/:id', validateRequestParams(taskIdParamSchema), getTaskByIdHandler);
taskRouter.post('/', validateRequestBody(createTaskSchema), createTaskHandler);
taskRouter.put(
  '/:id',
  validateRequestParams(taskIdParamSchema),
  validateRequestBody(updateTaskSchema),
  updateTaskHandler
);
taskRouter.delete('/:id', validateRequestParams(taskIdParamSchema), deleteTaskHandler);

export { taskRouter };
