export interface PagedResponse<T> {
  items?: T[];
  page?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  
  // Soporte PascalCase desde backend .NET
  Items?: T[];
  Page?: number;
  PageSize?: number;
  TotalItems?: number;
  TotalPages?: number;
  HasNextPage?: boolean;
  HasPreviousPage?: boolean;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  extensions?: Record<string, unknown>;
}
