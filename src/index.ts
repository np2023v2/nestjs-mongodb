// Module
export * from './mongoose.module';

// Models
export * from './models/base.model';

// Repositories
export * from './repositories/base.repository';

// Interfaces
export * from './interfaces/base.interface';
export * from './interfaces/mongoose-options.interface';

// Utils
export * from './utils/query.utils';
export * from './utils/connection.utils';

// Decorators
export * from './decorators/inject.decorator';

// Re-export commonly used Mongoose decorators and types
export { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
export { getModelToken, getConnectionToken } from '@nestjs/mongoose';
export type {
  Model,
  Document,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
  Connection,
  Schema as MongooseSchema,
} from 'mongoose';
