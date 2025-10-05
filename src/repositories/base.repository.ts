import { Model, FilterQuery, UpdateQuery, QueryOptions, PipelineStage } from 'mongoose';
import {
  BaseRepositoryInterface,
  PaginationOptions,
  PaginationResult,
} from '../interfaces/base.interface';

export class BaseRepository<T> implements BaseRepositoryInterface<T> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    const createdEntity = new this.model(data);
    return createdEntity.save() as unknown as T;
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async findAll(filter: FilterQuery<T> = {}, options: QueryOptions = {}): Promise<T[]> {
    return this.model.find(filter, null, options).exec();
  }

  async findWithPagination(
    filter: FilterQuery<T> = {},
    options: PaginationOptions = {},
  ): Promise<PaginationResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const query = this.model.find(filter).skip(skip).limit(limit);

    if (options.sort) {
      query.sort(options.sort);
    }

    const [data, total] = await Promise.all([query.exec(), this.model.countDocuments(filter)]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async updateMany(filter: FilterQuery<T>, data: UpdateQuery<T>): Promise<number> {
    const result = await this.model.updateMany(filter, data).exec();
    return result.modifiedCount;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async deleteMany(filter: FilterQuery<T>): Promise<number> {
    const result = await this.model.deleteMany(filter).exec();
    return result.deletedCount;
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).limit(1).exec();
    return count > 0;
  }

  async aggregate<R = any>(pipeline: PipelineStage[]): Promise<R[]> {
    return this.model.aggregate<R>(pipeline).exec();
  }
}
