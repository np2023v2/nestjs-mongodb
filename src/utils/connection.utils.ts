import * as mongoose from 'mongoose';

/**
 * Validate if a string is a valid MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Convert string to ObjectId
 */
export function toObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

/**
 * Convert ObjectId to string
 */
export function toObjectIdString(id: mongoose.Types.ObjectId): string {
  return id.toString();
}

/**
 * Generate a new ObjectId
 */
export function generateObjectId(): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId();
}

/**
 * Check if MongoDB connection is ready
 */
export function isConnectionReady(connection: mongoose.Connection): boolean {
  return connection.readyState === 1;
}

/**
 * Wait for MongoDB connection to be ready
 */
export async function waitForConnection(
  connection: mongoose.Connection,
  timeout = 30000,
): Promise<void> {
  if (isConnectionReady(connection)) {
    return;
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`MongoDB connection timeout after ${timeout}ms`));
    }, timeout);

    connection.once('connected', () => {
      clearTimeout(timeoutId);
      resolve();
    });

    connection.once('error', (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });
  });
}

/**
 * Safely close MongoDB connection
 */
export async function closeConnection(connection: mongoose.Connection): Promise<void> {
  if (connection && connection.readyState !== 0) {
    await connection.close();
  }
}
