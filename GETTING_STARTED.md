# Getting Started with NestJS MongoDB

This guide will help you get started with the NestJS MongoDB module.

## Prerequisites

- Node.js (v16 or higher)
- NestJS application
- MongoDB instance (local or cloud)

## Installation

```bash
npm install @np2023v2/nestjs-mongodb @nestjs/mongoose mongoose
```

## Quick Setup

### 1. Configure the Module

In your `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@np2023v2/nestjs-mongodb';

@Module({
  imports: [
    MongooseModule.forRoot({
      uri: 'mongodb://localhost:27017/myapp',
    }),
  ],
})
export class AppModule {}
```

### 2. Create Your First Model

Create a file `cat.model.ts`:

```typescript
import { Prop, Schema, SchemaFactory } from '@np2023v2/nestjs-mongodb';
import { BaseModel } from '@np2023v2/nestjs-mongodb';

@Schema({ collection: 'cats' })
export class Cat extends BaseModel {
  @Prop({ required: true })
  name: string;

  @Prop()
  age: number;

  @Prop()
  breed: string;
}

export const CatSchema = SchemaFactory.createForClass(Cat);
```

### 3. Create a Repository

Create a file `cat.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@np2023v2/nestjs-mongodb';
import { Cat } from './cat.model';

@Injectable()
export class CatRepository extends BaseRepository<Cat> {
  constructor(@InjectModel(Cat.name) private catModel: Model<Cat>) {
    super(catModel);
  }

  // Add custom methods here
  async findByBreed(breed: string): Promise<Cat[]> {
    return this.findAll({ breed });
  }
}
```

### 4. Create a Service

Create a file `cat.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { CatRepository } from './cat.repository';

@Injectable()
export class CatService {
  constructor(private readonly catRepository: CatRepository) {}

  async create(name: string, age: number, breed: string) {
    return this.catRepository.create({ name, age, breed });
  }

  async findAll() {
    return this.catRepository.findAll();
  }

  async findById(id: string) {
    return this.catRepository.findById(id);
  }
}
```

### 5. Register in Module

Create a file `cat.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@np2023v2/nestjs-mongodb';
import { Cat, CatSchema } from './cat.model';
import { CatRepository } from './cat.repository';
import { CatService } from './cat.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }]),
  ],
  providers: [CatRepository, CatService],
  exports: [CatService],
})
export class CatModule {}
```

### 6. Use in Controller

Create a file `cat.controller.ts`:

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CatService } from './cat.service';

@Controller('cats')
export class CatController {
  constructor(private readonly catService: CatService) {}

  @Post()
  async create(@Body() body: { name: string; age: number; breed: string }) {
    return this.catService.create(body.name, body.age, body.breed);
  }

  @Get()
  async findAll() {
    return this.catService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.catService.findById(id);
  }
}
```

## Next Steps

- Check out the [full documentation](README.md) for more features
- See the [examples](examples/) directory for more complex use cases
- Learn about [query utilities](README.md#query-utilities) for advanced querying
- Explore [pagination support](README.md#pagination-example)

## Common Issues

### Connection Errors

Make sure your MongoDB instance is running and accessible:

```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"
```

### Import Errors

Ensure you have all peer dependencies installed:

```bash
npm install @nestjs/common @nestjs/core @nestjs/mongoose mongoose reflect-metadata rxjs
```

## Need Help?

- Check the [README](README.md) for detailed documentation
- Look at the [examples](examples/) for reference implementations
- Open an issue on GitHub if you encounter problems
