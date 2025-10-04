import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';

export interface BaseEntity {
  _id?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BaseRepositoryInterface<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  findAll(filter?: FilterQuery<T>, options?: QueryOptions): Promise<T[]>;
  findWithPagination(
    filter?: FilterQuery<T>,
    options?: PaginationOptions,
  ): Promise<PaginationResult<T>>;
  update(id: string, data: UpdateQuery<T>): Promise<T | null>;
  updateMany(filter: FilterQuery<T>, data: UpdateQuery<T>): Promise<number>;
  delete(id: string): Promise<boolean>;
  deleteMany(filter: FilterQuery<T>): Promise<number>;
  count(filter?: FilterQuery<T>): Promise<number>;
  exists(filter: FilterQuery<T>): Promise<boolean>;
}
