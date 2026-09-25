import type { Selectable } from 'kysely';
import { db } from '../auth';
import {
  UserRole,
  type AdminUsersResponse,
  type AdminUsersQueryParams,
  type AdminUserDetail,
  type UserTable,
} from '@snake/types';

export type RawUserRow = Selectable<UserTable> | UserTable;

/**
 * Retrieves a paginated list of user accounts with optional search filtering across
 * name, email, role, and ID.
 *
 * @param queryParams - Filter and pagination criteria (`page`, `limit`, `search`)
 * @returns Paginated list of users with total count, total pages, and current page info
 *
 * @example
 * const result = await getAdminUsersPaginated({ page: 1, limit: 10, search: 'developer' });
 */
export const getAdminUsersPaginated = async (
  queryParams: AdminUsersQueryParams
): Promise<AdminUsersResponse> => {
  const requestedPage = Math.max(1, queryParams.page || 1);
  const requestedLimit = Math.max(1, Math.min(100, queryParams.limit || 10));
  const searchQuery = queryParams.search ? queryParams.search.trim() : '';

  let baseQuery = db.selectFrom('user');
  let countQuery = db.selectFrom('user');

  if (searchQuery) {
    const searchPattern = `%${searchQuery}%`;
    baseQuery = baseQuery.where((expressionBuilder) =>
      expressionBuilder.or([
        expressionBuilder('name', 'like', searchPattern),
        expressionBuilder('email', 'like', searchPattern),
        expressionBuilder('role', 'like', searchPattern),
        expressionBuilder('id', 'like', searchPattern),
      ])
    );
    countQuery = countQuery.where((expressionBuilder) =>
      expressionBuilder.or([
        expressionBuilder('name', 'like', searchPattern),
        expressionBuilder('email', 'like', searchPattern),
        expressionBuilder('role', 'like', searchPattern),
        expressionBuilder('id', 'like', searchPattern),
      ])
    );
  }

  const totalCountResult = await countQuery
    .select((expressionBuilder) => expressionBuilder.fn.count<number>('id').as('count'))
    .executeTakeFirst();
  const totalCount = Number(totalCountResult?.count || 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / requestedLimit));
  const offset = (requestedPage - 1) * requestedLimit;

  const rawUsers = await baseQuery
    .selectAll()
    .limit(requestedLimit)
    .offset(offset)
    .execute();

  const formattedUsers: AdminUserDetail[] = rawUsers.map((userRow: RawUserRow) => ({
    id: userRow.id,
    name: userRow.name || '',
    email: userRow.email,
    emailVerified: Boolean(userRow.emailVerified),
    image: userRow.image || null,
    role: (userRow.role as UserRole) || UserRole.User,
    createdAt:
      typeof userRow.createdAt === 'number'
        ? new Date(userRow.createdAt).toISOString()
        : String(userRow.createdAt),
    updatedAt:
      typeof userRow.updatedAt === 'number'
        ? new Date(userRow.updatedAt).toISOString()
        : String(userRow.updatedAt),
  }));

  return {
    users: formattedUsers,
    pagination: {
      page: requestedPage,
      limit: requestedLimit,
      totalCount,
      totalPages,
    },
  };
};
