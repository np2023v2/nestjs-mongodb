import { FilterQuery } from 'mongoose';

/**
 * Build a search query for text fields
 */
export function buildTextSearchQuery<T>(searchText: string, fields: string[]): FilterQuery<T> {
  if (!searchText || !fields.length) {
    return {};
  }

  const searchRegex = new RegExp(searchText, 'i');
  return {
    $or: fields.map((field) => ({
      [field]: searchRegex,
    })),
  } as FilterQuery<T>;
}

/**
 * Build a date range query
 */
export function buildDateRangeQuery<T>(
  field: string,
  startDate?: Date,
  endDate?: Date,
): FilterQuery<T> {
  const query: any = {};

  if (startDate || endDate) {
    query[field] = {};
    if (startDate) {
      query[field].$gte = startDate;
    }
    if (endDate) {
      query[field].$lte = endDate;
    }
  }

  return query;
}

/**
 * Build a query with multiple filters
 */
export function buildFilterQuery<T>(filters: Record<string, any>): FilterQuery<T> {
  const query: any = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        query[key] = { $in: value };
      } else if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
        query[key] = { $gte: value.min, $lte: value.max };
      } else {
        query[key] = value;
      }
    }
  });

  return query;
}

/**
 * Merge multiple filter queries
 */
export function mergeFilterQueries<T>(...queries: FilterQuery<T>[]): FilterQuery<T> {
  const mergedQuery: any = { $and: [] };

  queries.forEach((query) => {
    if (query && Object.keys(query).length > 0) {
      mergedQuery.$and.push(query);
    }
  });

  if (mergedQuery.$and.length === 0) {
    return {};
  }

  if (mergedQuery.$and.length === 1) {
    return mergedQuery.$and[0];
  }

  return mergedQuery;
}

/**
 * Build projection object for selecting specific fields
 */
export function buildProjection(fields: string[]): Record<string, number> {
  const projection: Record<string, number> = {};
  fields.forEach((field) => {
    projection[field] = 1;
  });
  return projection;
}

/**
 * Build sort object from array of sort strings
 * Example: ['name', '-createdAt'] => { name: 1, createdAt: -1 }
 */
export function buildSortObject(sortFields: string[]): Record<string, 1 | -1> {
  const sort: Record<string, 1 | -1> = {};

  sortFields.forEach((field) => {
    if (field.startsWith('-')) {
      sort[field.substring(1)] = -1;
    } else {
      sort[field] = 1;
    }
  });

  return sort;
}
