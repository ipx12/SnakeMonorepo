import { Router } from 'express';
import { adminUsersQuerySchema } from '@snake/types';
import { requireAdmin } from '../middlewares/auth.middleware';
import { validateRequestQuery } from '../middlewares/validate.middleware';
import { getAdminUsersHandler } from '../controllers/admin.controller';

const adminRouter = Router();

// All admin routes require admin authentication
adminRouter.use(requireAdmin);

adminRouter.get('/users', validateRequestQuery(adminUsersQuerySchema), getAdminUsersHandler);

export { adminRouter };
