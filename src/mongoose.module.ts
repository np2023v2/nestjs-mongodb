import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { MongooseModule as NestMongooseModule } from '@nestjs/mongoose';
import {
  MongooseModuleOptions,
  MongooseModuleAsyncOptions,
  MongooseModuleOptionsFactory,
} from './interfaces/mongoose-options.interface';

@Module({})
export class MongooseModule {
  /**
   * Register MongoDB connection with the given options
   */
  static forRoot(options: MongooseModuleOptions): DynamicModule {
    return {
      module: MongooseModule,
      imports: [
        NestMongooseModule.forRoot(options.uri, {
          connectionName: options.connectionName,
          retryAttempts: options.retryAttempts || 3,
          retryDelay: options.retryDelay || 1000,
          connectionFactory: options.connectionFactory,
        }),
      ],
      exports: [NestMongooseModule],
    };
  }

  /**
   * Register MongoDB connection asynchronously
   */
  static forRootAsync(options: MongooseModuleAsyncOptions): DynamicModule {
    return {
      module: MongooseModule,
      imports: [
        NestMongooseModule.forRootAsync({
          connectionName: options.connectionName,
          imports: options.imports,
          useFactory: async (...args: any[]) => {
            if (options.useFactory) {
              const config = await options.useFactory(...args);
              return {
                uri: config.uri,
                retryAttempts: config.retryAttempts || 3,
                retryDelay: config.retryDelay || 1000,
                connectionFactory: config.connectionFactory,
              };
            }
            return {};
          },
          inject: options.inject || [],
        }),
      ],
      exports: [NestMongooseModule],
    };
  }

  /**
   * Register models for a specific connection
   */
  static forFeature(
    models: { name: string; schema: any }[],
    connectionName?: string,
  ): DynamicModule {
    return NestMongooseModule.forFeature(models, connectionName);
  }
}
