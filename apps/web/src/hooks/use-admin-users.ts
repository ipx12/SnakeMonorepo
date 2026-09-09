'use client';

import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { adminUsersQueryOptions } from '@/lib/query-options';
import { UserRole } from '@snake/types';

export interface UseAdminUsersOptions {
  enabled?: boolean;
  initialPage?: number;
  initialPageSize?: number;
}

export function useAdminUsers(options: UseAdminUsersOptions = {}) {
  const { enabled = true, initialPage = 1, initialPageSize = 10 } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search input by 300ms
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setCurrentPage(1); // Reset to first page on search query change
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  const { data, isLoading: isUsersLoading, isError, error, isFetching, refetch } = useQuery({
    ...adminUsersQueryOptions({
      page: currentPage,
      limit: pageSize,
      search: debouncedSearchQuery,
    }),
    placeholderData: keepPreviousData,
    enabled,
  });

  const usersList = data?.users || [];
  const paginationMeta = data?.pagination || {
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
  };

  const errorMessage = isError && error instanceof Error ? error.message : '';

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > paginationMeta.totalPages) return;
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const totalUsers = paginationMeta.totalCount;
  const adminCount = usersList.filter((userItem) => userItem.role === UserRole.Admin).length;
  const regularCount = usersList.filter((userItem) => userItem.role === UserRole.User).length;

  return {
    currentPage,
    pageSize,
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    usersList,
    paginationMeta,
    isUsersLoading,
    isFetching,
    errorMessage,
    refetch,
    handlePageChange,
    handlePageSizeChange,
    totalUsers,
    adminCount,
    regularCount,
  };
}
