# NestJS MongoDB

A comprehensive NestJS module for MongoDB with common models, repositories, and utilities. This module provides a clean and easy-to-use abstraction layer for MongoDB operations in NestJS applications.

## Features

- 🚀 **Easy MongoDB Connection** - Simple setup with sync and async configuration
- 📦 **Base Model** - Common base model with timestamps and automatic transformations
- 🗂️ **Base Repository** - Full-featured repository pattern with common operations
- 🔍 **Query Utilities** - Helper functions for building complex queries
- 🔌 **Connection Utilities** - Tools for managing MongoDB connections
- 📄 **Pagination Support** - Built-in pagination with customizable options
- 🎯 **TypeScript** - Full TypeScript support with type definitions
- ✨ **Decorators** - Convenient decorators for dependency injection

## Installation

```bash
npm install @np2023v2/nestjs-mongodb
```

### Peer Dependencies

Make sure you have the following peer dependencies installed:

```bash
npm install @nestjs/common @nestjs/core mongoose reflect-metadata rxjs
```

## Quick Start

### 1. Module Setup

#### Synchronous Configuration

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@np2023v2/nestjs-mongodb';

@Module({
  imports: [
    MongooseModule.forRoot({
      uri: 'mongodb://localhost:27017/mydb',
      connectionName: 'default',
      retryAttempts: 3,
      retryDelay: 1000,
    }),
  ],
})
export class AppModule {}
```

#### Asynchronous Configuration

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@np2023v2/nestjs-mongodb';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        retryAttempts: 3,
        retryDelay: 1000,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### 2. Create a Model

```typescript
import { Prop, Schema, SchemaFactory } from '@np2023v2/nestjs-mongodb';
import { BaseModel } from '@np2023v2/nestjs-mongodb';

@Schema({ collection: 'users' })
export class User extends BaseModel {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  age?: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### 3. Create a Repository

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel, BaseRepository } from '@np2023v2/nestjs-mongodb';
import { Model } from 'mongoose';
import { User } from './user.model';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    super(userModel);
  }

  // Add custom methods specific to your entity
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.findAll({ isActive: true });
  }
}
```

### 4. Register Model in Module

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@np2023v2/nestjs-mongodb';
import { User, UserSchema } from './user.model';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UserRepository, UserService],
  exports: [UserRepository, UserService],
})
export class UserModule {}
```

### 5. Use in Service

```typescript
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './user.model';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(name: string, email: string, age?: number): Promise<User> {
    return this.userRepository.create({ name, email, age });
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUsersWithPagination(page: number, limit: number) {
    return this.userRepository.findWithPagination({}, { page, limit });
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    return this.userRepository.update(id, data);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }
}
```

## API Reference

### BaseRepository Methods

The `BaseRepository` class provides the following methods:

- **`create(data: Partial<T>): Promise<T>`** - Create a new document
- **`findById(id: string): Promise<T | null>`** - Find document by ID
- **`findOne(filter: FilterQuery<T>): Promise<T | null>`** - Find single document
- **`findAll(filter?: FilterQuery<T>, options?: QueryOptions): Promise<T[]>`** - Find all documents
- **`findWithPagination(filter?: FilterQuery<T>, options?: PaginationOptions): Promise<PaginationResult<T>>`** - Find with pagination
- **`update(id: string, data: UpdateQuery<T>): Promise<T | null>`** - Update document by ID
- **`updateMany(filter: FilterQuery<T>, data: UpdateQuery<T>): Promise<number>`** - Update multiple documents
- **`delete(id: string): Promise<boolean>`** - Delete document by ID
- **`deleteMany(filter: FilterQuery<T>): Promise<number>`** - Delete multiple documents
- **`count(filter?: FilterQuery<T>): Promise<number>`** - Count documents
- **`exists(filter: FilterQuery<T>): Promise<boolean>`** - Check if document exists

### Query Utilities

```typescript
import {
  buildTextSearchQuery,
  buildDateRangeQuery,
  buildFilterQuery,
  mergeFilterQueries,
  buildProjection,
  buildSortObject,
} from '@np2023v2/nestjs-mongodb';

// Text search across multiple fields
const textQuery = buildTextSearchQuery('john', ['name', 'email']);

// Date range query
const dateQuery = buildDateRangeQuery('createdAt', new Date('2023-01-01'), new Date('2023-12-31'));

// Build filter query from object
const filterQuery = buildFilterQuery({
  age: { min: 18, max: 65 },
  status: ['active', 'pending'],
  isVerified: true,
});

// Merge multiple queries
const combinedQuery = mergeFilterQueries(textQuery, dateQuery, filterQuery);

// Build projection
const projection = buildProjection(['name', 'email']);

// Build sort object
const sort = buildSortObject(['name', '-createdAt']); // { name: 1, createdAt: -1 }
```

### Connection Utilities

```typescript
import {
  isValidObjectId,
  toObjectId,
  generateObjectId,
  isConnectionReady,
  waitForConnection,
  closeConnection,
} from '@np2023v2/nestjs-mongodb';

// Validate ObjectId
if (isValidObjectId(id)) {
  // Valid ObjectId
}

// Convert to ObjectId
const objectId = toObjectId(idString);

// Generate new ObjectId
const newId = generateObjectId();

// Check connection status
if (isConnectionReady(connection)) {
  // Connection is ready
}

// Wait for connection
await waitForConnection(connection, 30000);

// Close connection safely
await closeConnection(connection);
```

## Advanced Usage

### Custom Query Example

```typescript
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async searchUsers(searchText: string, minAge: number, maxAge: number) {
    const textQuery = buildTextSearchQuery(searchText, ['name', 'email']);
    const ageQuery = buildFilterQuery({ age: { min: minAge, max: maxAge } });
    const combinedQuery = mergeFilterQueries(textQuery, ageQuery);

    return this.userRepository.findAll(combinedQuery);
  }

  async getUsersByDateRange(startDate: Date, endDate: Date) {
    const dateQuery = buildDateRangeQuery('createdAt', startDate, endDate);
    const sort = buildSortObject(['-createdAt']);

    return this.userRepository.findWithPagination(dateQuery, {
      page: 1,
      limit: 20,
      sort,
    });
  }
}
```

### Pagination Example

```typescript
const result = await userRepository.findWithPagination(
  { isActive: true },
  { page: 1, limit: 10, sort: { createdAt: -1 } }
);

console.log(result.data); // Array of users
console.log(result.total); // Total count
console.log(result.page); // Current page
console.log(result.limit); // Items per page
console.log(result.totalPages); // Total pages
```

## Best Practices

1. **Always extend BaseModel** for your entities to get automatic timestamps and transformations
2. **Use BaseRepository** as a foundation and add custom methods for specific queries
3. **Leverage query utilities** to build complex, reusable queries
4. **Handle ObjectId validation** before querying to avoid errors
5. **Use pagination** for large datasets to improve performance
6. **Close connections properly** when shutting down your application

## License

MIT

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/np2023v2/nestjs-mongodb.git
cd nestjs-mongodb

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Lint code
npm run lint

# Format code
npm run format
```

### Publishing

See [PUBLISHING.md](./PUBLISHING.md) for detailed instructions on how to publish this package to npm.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Guidelines

- Write tests for new features
- Ensure all tests pass before submitting PR
- Follow the existing code style
- Update documentation as needed
