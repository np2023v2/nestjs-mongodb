import type * as mongodb from 'mongodb';

/**
 * Change operation types from MongoDB Change Streams
 */
export enum ChangeOperationType {
  INSERT = 'insert',
  UPDATE = 'update',
  REPLACE = 'replace',
  DELETE = 'delete',
  DROP = 'drop',
  RENAME = 'rename',
  DROP_DATABASE = 'dropDatabase',
  INVALIDATE = 'invalidate',
}

/**
 * Base interface for CDC change events
 */
export interface CdcChangeEvent<T = any> {
  operationType: ChangeOperationType;
  documentKey?: { _id: any };
  fullDocument?: T;
  updateDescription?: {
    updatedFields?: Record<string, any>;
    removedFields?: string[];
  };
  ns?: {
    db: string;
    coll: string;
  };
  clusterTime?: any;
}

/**
 * Configuration options for CDC service
 */
export interface CdcServiceOptions {
  /**
   * MongoDB Change Stream options
   */
  changeStreamOptions?: mongodb.ChangeStreamOptions;

  /**
   * Enable full document lookup for update operations
   */
  fullDocument?: 'default' | 'updateLookup' | 'whenAvailable' | 'required';

  /**
   * Resume token for resuming from a specific point
   */
  resumeAfter?: any;

  /**
   * Start watching from a specific timestamp
   */
  startAtOperationTime?: any;

  /**
   * Filter pipeline for change stream
   */
  pipeline?: any[];

  /**
   * Batch size for change stream
   */
  batchSize?: number;

  /**
   * Maximum await time in milliseconds
   */
  maxAwaitTimeMS?: number;

  /**
   * Auto-reconnect on error
   */
  autoReconnect?: boolean;

  /**
   * Reconnect delay in milliseconds
   */
  reconnectDelay?: number;

  /**
   * Maximum reconnect attempts (0 for unlimited)
   */
  maxReconnectAttempts?: number;
}

/**
 * CDC event handler interface
 */
export interface CdcEventHandler<T = any> {
  /**
   * Handle change event
   */
  onEvent(event: CdcChangeEvent<T>): Promise<void> | void;

  /**
   * Handle error
   */
  onError?(error: Error): Promise<void> | void;

  /**
   * Handle close event
   */
  onClose?(): Promise<void> | void;
}

/**
 * CDC service interface
 */
export interface CdcServiceInterface<T = any> {
  /**
   * Start watching for changes
   */
  start(): Promise<void>;

  /**
   * Stop watching for changes
   */
  stop(): Promise<void>;

  /**
   * Check if service is watching
   */
  isWatching(): boolean;

  /**
   * Register event handler
   */
  registerHandler(handler: CdcEventHandler<T>): void;

  /**
   * Unregister event handler
   */
  unregisterHandler(handler: CdcEventHandler<T>): void;

  /**
   * Get current resume token
   */
  getResumeToken(): any;
}
