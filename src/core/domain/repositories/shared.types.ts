/**
 * Shared Repository Types
 * 
 * Common types used across multiple repository interfaces.
 * Extracted to prevent circular dependencies.
 */

export interface Pagination {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

