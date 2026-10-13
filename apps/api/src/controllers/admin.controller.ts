import { Context } from 'hono';
import type { AdminUsersQueryParams } from '@snake/types';
import * as adminService from '../services/admin.service';

/**
 * Controller handler retrieving paginated system users for administrators.
 */
export const getAdminUsersHandler = async (c: Context) => {
  try {
    const queryParams = c.req.valid('query' as never) as AdminUsersQueryParams;
    const paginatedUsersResult = await adminService.getAdminUsersPaginated(queryParams);
    return c.json(paginatedUsersResult);
  } catch (caughtError: unknown) {
    const errorMessage = caughtError instanceof Error ? caughtError.message : 'Unknown server error';
    return c.json({ message: 'Failed to fetch users list', error: errorMessage }, 500);
  }
};
