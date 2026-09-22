import { Context } from 'hono';
import * as adminService from '../services/admin.service';

export const getAdminUsersHandler = async (c: Context) => {
  try {
    const queryParams = c.req.valid('query' as never); // Validated via zValidator
    const paginatedUsersResult = await adminService.getAdminUsersPaginated(queryParams as any);
    return c.json(paginatedUsersResult);
  } catch (caughtError: any) {
    return c.json({ message: 'Failed to fetch users list', error: caughtError.message }, 500);
  }
};
