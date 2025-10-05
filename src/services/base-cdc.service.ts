import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import type * as mongodb from 'mongodb';
import {
  CdcServiceInterface,
  CdcServiceOptions,
  CdcEventHandler,
  CdcChangeEvent,
  ChangeOperationType,
} from '../interfaces/cdc.interface';

/**
 * Base CDC (Change Data Capture) service for MongoDB
 *
 * This service provides a foundation for monitoring MongoDB collection changes
 * using MongoDB Change Streams. It can be extended for specific use cases.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserCdcService extends BaseCdcService<User> {
 *   constructor(@InjectModel(User.name) userModel: Model<User>) {
 *     super(userModel, {
 *       fullDocument: 'updateLookup',
 *       autoReconnect: true,
 *     });
 *   }
 *
 *   protected async handleInsert(event: CdcChangeEvent<User>): Promise<void> {
 *     console.log('New user created:', event.fullDocument);
 *   }
 *
 *   protected async handleUpdate(event: CdcChangeEvent<User>): Promise<void> {
 *     console.log('User updated:', event.fullDocument);
 *   }
 *
 *   protected async handleDelete(event: CdcChangeEvent<User>): Promise<void> {
 *     console.log('User deleted:', event.documentKey);
 *   }
 * }
 * ```
 */
export class BaseCdcService<T> implements CdcServiceInterface<T> {
  protected readonly logger: Logger;
  protected changeStream?: mongodb.ChangeStream;
  protected handlers: CdcEventHandler<T>[] = [];
  protected watching = false;
  protected resumeToken: any = null;
  protected reconnectAttempts = 0;
  protected cdcOptions: CdcServiceOptions;

  constructor(
    protected readonly model: Model<T>,
    options: CdcServiceOptions = {},
  ) {
    this.logger = new Logger(this.constructor.name);
    this.cdcOptions = options;
    this.applyDefaultOptions();
  }

  /**
   * Apply default options
   */
  protected applyDefaultOptions(): void {
    this.cdcOptions = {
      fullDocument: 'updateLookup',
      autoReconnect: true,
      reconnectDelay: 1000,
      maxReconnectAttempts: 5,
      ...this.cdcOptions,
    };
  }

  /**
   * Start watching for changes
   */
  async start(): Promise<void> {
    if (this.watching) {
      this.logger.warn('CDC service is already watching');
      return;
    }

    try {
      const changeStreamOptions: any = {
        fullDocument: this.cdcOptions.fullDocument,
        ...this.cdcOptions.changeStreamOptions,
      };

      if (this.cdcOptions.resumeAfter) {
        changeStreamOptions.resumeAfter = this.cdcOptions.resumeAfter;
      }

      if (this.cdcOptions.startAtOperationTime) {
        changeStreamOptions.startAtOperationTime = this.cdcOptions.startAtOperationTime;
      }

      if (this.cdcOptions.batchSize) {
        changeStreamOptions.batchSize = this.cdcOptions.batchSize;
      }

      if (this.cdcOptions.maxAwaitTimeMS) {
        changeStreamOptions.maxAwaitTimeMS = this.cdcOptions.maxAwaitTimeMS;
      }

      const pipeline = this.cdcOptions.pipeline || [];
      this.changeStream = this.model.watch(pipeline, changeStreamOptions);

      this.changeStream.on('change', (change: any) => {
        this.handleChange(change);
      });

      this.changeStream.on('error', (error: Error) => {
        this.handleError(error);
      });

      this.changeStream.on('close', () => {
        this.handleClose();
      });

      this.watching = true;
      this.reconnectAttempts = 0;
      this.logger.log('CDC service started successfully');
    } catch (error) {
      this.logger.error('Failed to start CDC service', error);
      throw error;
    }
  }

  /**
   * Stop watching for changes
   */
  async stop(): Promise<void> {
    if (!this.watching) {
      this.logger.warn('CDC service is not watching');
      return;
    }

    try {
      if (this.changeStream) {
        await this.changeStream.close();
        this.changeStream = undefined;
      }
      this.watching = false;
      this.logger.log('CDC service stopped successfully');
    } catch (error) {
      this.logger.error('Failed to stop CDC service', error);
      throw error;
    }
  }

  /**
   * Check if service is watching
   */
  isWatching(): boolean {
    return this.watching;
  }

  /**
   * Register event handler
   */
  registerHandler(handler: CdcEventHandler<T>): void {
    if (!this.handlers.includes(handler)) {
      this.handlers.push(handler);
      this.logger.debug('Event handler registered');
    }
  }

  /**
   * Unregister event handler
   */
  unregisterHandler(handler: CdcEventHandler<T>): void {
    const index = this.handlers.indexOf(handler);
    if (index !== -1) {
      this.handlers.splice(index, 1);
      this.logger.debug('Event handler unregistered');
    }
  }

  /**
   * Get current resume token
   */
  getResumeToken(): any {
    return this.resumeToken;
  }

  /**
   * Handle change event from MongoDB Change Stream
   */
  protected async handleChange(change: any): Promise<void> {
    try {
      // Store resume token
      if (change._id) {
        this.resumeToken = change._id;
      }

      const event: CdcChangeEvent<T> = {
        operationType: change.operationType as ChangeOperationType,
        documentKey: change.documentKey,
        fullDocument: change.fullDocument,
        updateDescription: change.updateDescription,
        ns: change.ns,
        clusterTime: change.clusterTime,
      };

      // Call specific handler based on operation type
      switch (event.operationType) {
        case ChangeOperationType.INSERT:
          await this.handleInsert(event);
          break;
        case ChangeOperationType.UPDATE:
          await this.handleUpdate(event);
          break;
        case ChangeOperationType.REPLACE:
          await this.handleReplace(event);
          break;
        case ChangeOperationType.DELETE:
          await this.handleDelete(event);
          break;
        default:
          await this.handleOther(event);
      }

      // Notify all registered handlers
      await this.notifyHandlers(event);
    } catch (error) {
      this.logger.error('Error handling change event', error);
      await this.handleError(error as Error);
    }
  }

  /**
   * Handle insert operation
   * Override this method in subclasses to implement custom logic
   */
  protected async handleInsert(event: CdcChangeEvent<T>): Promise<void> {
    this.logger.debug(`Insert operation: ${JSON.stringify(event.documentKey)}`);
  }

  /**
   * Handle update operation
   * Override this method in subclasses to implement custom logic
   */
  protected async handleUpdate(event: CdcChangeEvent<T>): Promise<void> {
    this.logger.debug(`Update operation: ${JSON.stringify(event.documentKey)}`);
  }

  /**
   * Handle replace operation
   * Override this method in subclasses to implement custom logic
   */
  protected async handleReplace(event: CdcChangeEvent<T>): Promise<void> {
    this.logger.debug(`Replace operation: ${JSON.stringify(event.documentKey)}`);
  }

  /**
   * Handle delete operation
   * Override this method in subclasses to implement custom logic
   */
  protected async handleDelete(event: CdcChangeEvent<T>): Promise<void> {
    this.logger.debug(`Delete operation: ${JSON.stringify(event.documentKey)}`);
  }

  /**
   * Handle other operations (drop, rename, etc.)
   * Override this method in subclasses to implement custom logic
   */
  protected async handleOther(event: CdcChangeEvent<T>): Promise<void> {
    this.logger.debug(`Other operation: ${event.operationType}`);
  }

  /**
   * Notify all registered handlers
   */
  protected async notifyHandlers(event: CdcChangeEvent<T>): Promise<void> {
    for (const handler of this.handlers) {
      try {
        await handler.onEvent(event);
      } catch (error) {
        this.logger.error('Error in event handler', error);
      }
    }
  }

  /**
   * Handle error
   */
  protected async handleError(error: Error): Promise<void> {
    this.logger.error('CDC service error', error);

    // Notify all registered handlers
    for (const handler of this.handlers) {
      if (handler.onError) {
        try {
          await handler.onError(error);
        } catch (err) {
          this.logger.error('Error in error handler', err);
        }
      }
    }

    // Auto-reconnect if enabled
    if (this.cdcOptions.autoReconnect && this.shouldReconnect()) {
      await this.reconnect();
    }
  }

  /**
   * Handle close event
   */
  protected async handleClose(): Promise<void> {
    this.logger.log('Change stream closed');
    this.watching = false;

    // Notify all registered handlers
    for (const handler of this.handlers) {
      if (handler.onClose) {
        try {
          await handler.onClose();
        } catch (error) {
          this.logger.error('Error in close handler', error);
        }
      }
    }

    // Auto-reconnect if enabled and not intentionally stopped
    if (this.cdcOptions.autoReconnect && this.shouldReconnect()) {
      await this.reconnect();
    }
  }

  /**
   * Check if should attempt reconnection
   */
  protected shouldReconnect(): boolean {
    const maxAttempts = this.cdcOptions.maxReconnectAttempts || 0;
    return maxAttempts === 0 || this.reconnectAttempts < maxAttempts;
  }

  /**
   * Attempt to reconnect
   */
  protected async reconnect(): Promise<void> {
    this.reconnectAttempts++;
    const delay = this.cdcOptions.reconnectDelay || 1000;

    this.logger.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.cdcOptions.maxReconnectAttempts || '∞'})...`,
    );

    await new Promise((resolve) => setTimeout(resolve, delay));

    try {
      // Resume from last known position if available
      if (this.resumeToken) {
        this.cdcOptions.resumeAfter = this.resumeToken;
      }

      await this.start();
      this.logger.log('Reconnected successfully');
    } catch (error) {
      this.logger.error('Reconnection failed', error);

      if (this.shouldReconnect()) {
        await this.reconnect();
      } else {
        this.logger.error('Maximum reconnection attempts reached');
      }
    }
  }

  /**
   * Cleanup resources
   */
  async onModuleDestroy(): Promise<void> {
    await this.stop();
  }
}
