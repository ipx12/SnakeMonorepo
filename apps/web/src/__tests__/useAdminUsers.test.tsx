import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAdminUsers } from '../hooks/use-admin-users';
import * as apiModule from '../lib/api';
import { UserRole } from '@snake/types';
import type { AdminUsersResponse } from '@snake/types';

vi.mock('../lib/api', () => ({
  getAdminUsers: vi.fn(),
}));

function createTestWrapper() {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });

  const WrapperComponent = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  );

  return { testQueryClient, WrapperComponent };
}

describe('useAdminUsers Hook Unit Tests', () => {
  const mockAdminUsersResponse: AdminUsersResponse = {
    users: [
      {
        id: 'admin-sample-1',
        name: 'Super Admin',
        email: 'admin@watermelon.ui',
        role: UserRole.Admin,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'user-sample-2',
        name: 'Regular Developer',
        email: 'dev@watermelon.ui',
        role: UserRole.User,
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      totalCount: 2,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return paginated admin users with default parameters', async () => {
    vi.mocked(apiModule.getAdminUsers).mockResolvedValueOnce(mockAdminUsersResponse);
    const { WrapperComponent } = createTestWrapper();

    const { result } = renderHook(() => useAdminUsers(), { wrapper: WrapperComponent });

    await waitFor(() => {
      expect(result.current.isUsersLoading).toBe(false);
    });

    expect(result.current.usersList).toEqual(mockAdminUsersResponse.users);
    expect(result.current.paginationMeta.totalCount).toBe(2);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(10);
  });

  it('should compute totalUsers, adminCount, and regularCount metrics correctly', async () => {
    vi.mocked(apiModule.getAdminUsers).mockResolvedValueOnce(mockAdminUsersResponse);
    const { WrapperComponent } = createTestWrapper();

    const { result } = renderHook(() => useAdminUsers(), { wrapper: WrapperComponent });

    await waitFor(() => {
      expect(result.current.isUsersLoading).toBe(false);
    });

    expect(result.current.totalUsers).toBe(2);
    expect(result.current.adminCount).toBe(1);
    expect(result.current.regularCount).toBe(1);
  });

  it('should debounce search query by 300ms before triggering new query parameters', async () => {
    vi.useFakeTimers();
    vi.mocked(apiModule.getAdminUsers).mockResolvedValue(mockAdminUsersResponse);
    const { WrapperComponent } = createTestWrapper();

    const { result } = renderHook(() => useAdminUsers(), { wrapper: WrapperComponent });

    act(() => {
      result.current.setSearchQuery('developer');
    });

    // Before 300ms, debounced query should remain empty
    expect(result.current.debouncedSearchQuery).toBe('');

    // Advance clock by 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.debouncedSearchQuery).toBe('developer');
    expect(result.current.currentPage).toBe(1);

    vi.useRealTimers();
  });

  it('should handle page changes within valid pagination bounds and ignore out of bounds', async () => {
    const multiPageResponse: AdminUsersResponse = {
      users: mockAdminUsersResponse.users,
      pagination: {
        page: 1,
        limit: 2,
        totalCount: 10,
        totalPages: 5,
      },
    };
    vi.mocked(apiModule.getAdminUsers).mockResolvedValue(multiPageResponse);
    const { WrapperComponent } = createTestWrapper();

    const { result } = renderHook(() => useAdminUsers(), { wrapper: WrapperComponent });

    await waitFor(() => {
      expect(result.current.isUsersLoading).toBe(false);
    });

    // Valid page advance
    act(() => {
      result.current.handlePageChange(2);
    });
    expect(result.current.currentPage).toBe(2);

    // Invalid negative / zero page
    act(() => {
      result.current.handlePageChange(0);
    });
    expect(result.current.currentPage).toBe(2);

    // Invalid beyond totalPages
    act(() => {
      result.current.handlePageChange(99);
    });
    expect(result.current.currentPage).toBe(2);
  });

  it('should update page size and reset currentPage to 1', async () => {
    vi.mocked(apiModule.getAdminUsers).mockResolvedValue(mockAdminUsersResponse);
    const { WrapperComponent } = createTestWrapper();

    const { result } = renderHook(() => useAdminUsers(), { wrapper: WrapperComponent });

    await waitFor(() => {
      expect(result.current.isUsersLoading).toBe(false);
    });

    act(() => {
      result.current.handlePageChange(2);
    });
    act(() => {
      result.current.handlePageSizeChange(25);
    });

    expect(result.current.pageSize).toBe(25);
    expect(result.current.currentPage).toBe(1);
  });
});
