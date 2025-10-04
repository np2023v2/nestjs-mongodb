import { ModuleMetadata, Type } from '@nestjs/common';

export interface MongooseModuleOptions {
  uri: string;
  connectionName?: string;
  retryAttempts?: number;
  retryDelay?: number;
  connectionFactory?: (connection: any) => any;
}

export interface MongooseModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  connectionName?: string;
  useFactory?: (...args: any[]) => Promise<MongooseModuleOptions> | MongooseModuleOptions;
  inject?: any[];
  useClass?: Type<MongooseModuleOptionsFactory>;
  useExisting?: Type<MongooseModuleOptionsFactory>;
}

export interface MongooseModuleOptionsFactory {
  createMongooseOptions(): Promise<MongooseModuleOptions> | MongooseModuleOptions;
}
