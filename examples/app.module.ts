import { Module } from '@nestjs/common';
import { MongooseModule } from '@np2023v2/nestjs-mongodb';
import { UserModule } from './user.module';

@Module({
  imports: [
    MongooseModule.forRoot({
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nestjs-mongodb-example',
      retryAttempts: 3,
      retryDelay: 1000,
    }),
    UserModule,
  ],
})
export class AppModule {}
