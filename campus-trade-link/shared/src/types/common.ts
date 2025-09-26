export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
  total?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FileUpload {
  id: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
  createdAt: Date;
}

export type SortOrder = 'asc' | 'desc';

export interface SearchParams {
  query: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    order: SortOrder;
  };
}