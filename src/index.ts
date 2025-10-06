// Module
export * from './mongoose.module';

// Models
export * from './models/base.model';

// Repositories
export * from './repositories/base.repository';

// Interfaces
export * from './interfaces/base.interface';
export * from './interfaces/mongoose-options.interface';
export * from './interfaces/cdc.interface';

// Services
export * from './services/base-cdc.service';

// Utils
export * from './utils/query.utils';
export * from './utils/connection.utils';
export * from './utils/aggregate.utils';

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
  PipelineStage,
} from 'mongoose';
