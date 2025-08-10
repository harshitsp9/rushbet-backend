export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface SortingQuery {
  sort?: string;
  sortingBy?: 'asc' | 'desc';
}

export interface SearchQuery {
  search?: string;
}

export interface CreatedByQuery {
  createdBy?: string;
}

export interface FilterQuery {
  [key: string]: any;
  $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
}
