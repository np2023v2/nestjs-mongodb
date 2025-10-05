import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BaseCdcService,
  CdcChangeEvent,
  CdcEventHandler,
} from '@np2023v2/nestjs-mongodb';
import { User } from './user.model';

/**
 * Example CDC service for User collection
 * 
 * This service watches for changes in the User collection and can perform
 * custom actions based on those changes.
 */
@Injectable()
export class UserCdcService extends BaseCdcService<User> implements OnModuleInit, OnModuleDestroy {
  constructor(@InjectModel(User.name) userModel: Model<User>) {
    super(userModel, {
      fullDocument: 'updateLookup', // Get full document on updates
      autoReconnect: true,
      reconnectDelay: 2000,
      maxReconnectAttempts: 10,
      // Optional: Filter only specific operations
      // pipeline: [{ $match: { operationType: 'insert' } }],
    });
  }

  /**
   * Start watching when module initializes
   */
  async onModuleInit(): Promise<void> {
    await this.start();
    this.logger.log('User CDC service initialized');
  }

  /**
   * Stop watching when module destroys
   */
  async onModuleDestroy(): Promise<void> {
    await this.stop();
    this.logger.log('User CDC service destroyed');
  }

  /**
   * Handle new user creation
   */
  protected async handleInsert(event: CdcChangeEvent<User>): Promise<void> {
    const user = event.fullDocument;
    if (user) {
      this.logger.log(`New user created: ${user.name} (${user.email})`);
      
      // Example: Send welcome email
      // await this.emailService.sendWelcomeEmail(user.email, user.name);
      
      // Example: Create user profile
      // await this.profileService.createProfile(user._id);
    }
  }

  /**
   * Handle user updates
   */
  protected async handleUpdate(event: CdcChangeEvent<User>): Promise<void> {
    const user = event.fullDocument;
    const updatedFields = event.updateDescription?.updatedFields;
    
    this.logger.log(`User updated: ${JSON.stringify(event.documentKey)}`);
    
    if (updatedFields) {
      // Example: Notify about email change
      if (updatedFields.email) {
        this.logger.log(`User email changed to: ${updatedFields.email}`);
        // await this.emailService.sendEmailChangeNotification(user);
      }
      
      // Example: Invalidate cache on user update
      if (user) {
        // await this.cacheService.invalidate(`user:${user._id}`);
      }
    }
  }

  /**
   * Handle user deletion
   */
  protected async handleDelete(event: CdcChangeEvent<User>): Promise<void> {
    const userId = event.documentKey?._id;
    if (userId) {
      this.logger.log(`User deleted: ${userId}`);
      
      // Example: Clean up related data
      // await this.profileService.deleteProfile(userId);
      // await this.cacheService.invalidate(`user:${userId}`);
    }
  }
}

/**
 * Example: Using event handlers for more complex scenarios
 */
@Injectable()
export class UserCdcEventHandler implements CdcEventHandler<User> {
  constructor(
    // Inject any services you need
    // private readonly auditService: AuditService,
    // private readonly notificationService: NotificationService,
  ) {}

  async onEvent(event: CdcChangeEvent<User>): Promise<void> {
    // Log all changes to audit trail
    // await this.auditService.logChange({
    //   collection: 'users',
    //   operation: event.operationType,
    //   documentId: event.documentKey?._id,
    //   timestamp: new Date(),
    // });

    // Send real-time notifications
    if (event.operationType === 'insert' && event.fullDocument) {
      // await this.notificationService.notifyAdmins(
      //   `New user registered: ${event.fullDocument.name}`
      // );
    }
  }

  async onError(error: Error): Promise<void> {
    // Handle errors
    console.error('CDC error:', error);
  }

  async onClose(): Promise<void> {
    // Handle connection close
    console.log('CDC connection closed');
  }
}

/**
 * Example: Module configuration
 */
// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@np2023v2/nestjs-mongodb';
// import { User, UserSchema } from './user.model';
// import { UserCdcService } from './user-cdc.service';
// import { UserCdcEventHandler } from './user-cdc.service';
//
// @Module({
//   imports: [
//     MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
//   ],
//   providers: [UserCdcService, UserCdcEventHandler],
//   exports: [UserCdcService],
// })
// export class UserModule {
//   constructor(
//     private readonly userCdcService: UserCdcService,
//     private readonly userCdcEventHandler: UserCdcEventHandler,
//   ) {
//     // Register the event handler
//     this.userCdcService.registerHandler(this.userCdcEventHandler);
//   }
// }
