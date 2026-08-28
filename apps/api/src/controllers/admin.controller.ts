import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import type { AdminUsersQueryParams } from '@snake/types';
import * as adminService from '../services/admin.service';

export const getAdminUsersHandler = async (httpRequest: AuthenticatedRequest, httpResponse: Response) => {
  try {
    const queryParams: AdminUsersQueryParams = httpRequest.query as unknown as AdminUsersQueryParams;
    const paginatedUsersResult = await adminService.getAdminUsersPaginated(queryParams);
    httpResponse.json(paginatedUsersResult);
  } catch (caughtError: any) {
    httpResponse.status(500).json({ message: 'Failed to fetch users list', error: caughtError.message });
  }
};
