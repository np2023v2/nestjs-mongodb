import { Model } from 'mongoose';
import { EventEmitter } from 'events';
import { BaseCdcService } from '../src/services/base-cdc.service';
import {
  CdcEventHandler,
  CdcChangeEvent,
  ChangeOperationType,
  CdcServiceOptions,
} from '../src/interfaces/cdc.interface';

// Mock Logger to avoid console output during tests
jest.mock('@nestjs/common', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

// Mock Model interface for testing
interface TestDocument {
  _id: string;
  name: string;
  value: number;
}

// Extended CDC service for testing
class TestCdcService extends BaseCdcService<TestDocument> {
  public insertEvents: CdcChangeEvent<TestDocument>[] = [];
  public updateEvents: CdcChangeEvent<TestDocument>[] = [];
  public deleteEvents: CdcChangeEvent<TestDocument>[] = [];

  protected async handleInsert(event: CdcChangeEvent<TestDocument>): Promise<void> {
    this.insertEvents.push(event);
    await super.handleInsert(event);
  }

  protected async handleUpdate(event: CdcChangeEvent<TestDocument>): Promise<void> {
    this.updateEvents.push(event);
    await super.handleUpdate(event);
  }

  protected async handleDelete(event: CdcChangeEvent<TestDocument>): Promise<void> {
    this.deleteEvents.push(event);
    await super.handleDelete(event);
  }
}

describe('BaseCdcService', () => {
  let mockModel: any;
  let mockChangeStream: any;
  let cdcService: TestCdcService;

  beforeEach(() => {
    // Create a mock change stream
    mockChangeStream = new EventEmitter();
    (mockChangeStream as any).close = jest.fn().mockResolvedValue(undefined);

    // Create a mock model
    mockModel = {
      watch: jest.fn().mockReturnValue(mockChangeStream),
    } as unknown as Model<TestDocument>;

    // Create CDC service instance
    cdcService = new TestCdcService(mockModel);
  });

  afterEach(async () => {
    if (cdcService.isWatching()) {
      await cdcService.stop();
    }
  });

  describe('start', () => {
    it('should start watching for changes', async () => {
      await cdcService.start();

      expect(mockModel.watch).toHaveBeenCalledWith([], expect.any(Object));
      expect(cdcService.isWatching()).toBe(true);
    });

    it('should use custom pipeline when provided', async () => {
      const pipeline = [{ $match: { operationType: 'insert' } }];
      const options: CdcServiceOptions = { pipeline };

      cdcService = new TestCdcService(mockModel, options);
      await cdcService.start();

      expect(mockModel.watch).toHaveBeenCalledWith(pipeline, expect.any(Object));
    });

    it('should warn if already watching', async () => {
      await cdcService.start();
      await cdcService.start();

      expect(mockModel.watch).toHaveBeenCalledTimes(1);
    });

    it('should apply fullDocument option', async () => {
      const options: CdcServiceOptions = { fullDocument: 'required' };

      cdcService = new TestCdcService(mockModel, options);
      await cdcService.start();

      expect(mockModel.watch).toHaveBeenCalledWith(
        [],
        expect.objectContaining({ fullDocument: 'required' }),
      );
    });
  });

  describe('stop', () => {
    it('should stop watching for changes', async () => {
      await cdcService.start();
      await cdcService.stop();

      expect(mockChangeStream.close).toHaveBeenCalled();
      expect(cdcService.isWatching()).toBe(false);
    });

    it('should warn if not watching', async () => {
      await cdcService.stop();

      expect(mockChangeStream.close).not.toHaveBeenCalled();
    });
  });

  describe('event handling', () => {
    beforeEach(async () => {
      await cdcService.start();
    });

    it('should handle insert events', async () => {
      const changeEvent = {
        _id: { _data: 'token123' },
        operationType: 'insert',
        documentKey: { _id: '123' },
        fullDocument: { _id: '123', name: 'test', value: 42 },
        ns: { db: 'testdb', coll: 'testcoll' },
        clusterTime: new Date(),
      };

      // Simulate change event
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          mockChangeStream.emit('change', changeEvent);
          resolve();
        }, 10);
      });

      // Wait a bit for async handlers
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(cdcService.insertEvents).toHaveLength(1);
      expect(cdcService.insertEvents[0].operationType).toBe(ChangeOperationType.INSERT);
      expect(cdcService.insertEvents[0].fullDocument?.name).toBe('test');
    });

    it('should handle update events', async () => {
      const changeEvent = {
        _id: { _data: 'token456' },
        operationType: 'update',
        documentKey: { _id: '123' },
        fullDocument: { _id: '123', name: 'updated', value: 100 },
        updateDescription: {
          updatedFields: { name: 'updated', value: 100 },
          removedFields: [],
        },
        ns: { db: 'testdb', coll: 'testcoll' },
        clusterTime: new Date(),
      };

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          mockChangeStream.emit('change', changeEvent);
          resolve();
        }, 10);
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(cdcService.updateEvents).toHaveLength(1);
      expect(cdcService.updateEvents[0].operationType).toBe(ChangeOperationType.UPDATE);
      expect(cdcService.updateEvents[0].updateDescription?.updatedFields?.name).toBe('updated');
    });

    it('should handle delete events', async () => {
      const changeEvent = {
        _id: { _data: 'token789' },
        operationType: 'delete',
        documentKey: { _id: '123' },
        ns: { db: 'testdb', coll: 'testcoll' },
        clusterTime: new Date(),
      };

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          mockChangeStream.emit('change', changeEvent);
          resolve();
        }, 10);
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(cdcService.deleteEvents).toHaveLength(1);
      expect(cdcService.deleteEvents[0].operationType).toBe(ChangeOperationType.DELETE);
    });

    it('should store resume token', async () => {
      const changeEvent = {
        _id: { _data: 'resume-token-123' },
        operationType: 'insert',
        documentKey: { _id: '123' },
        fullDocument: { _id: '123', name: 'test', value: 42 },
        ns: { db: 'testdb', coll: 'testcoll' },
        clusterTime: new Date(),
      };

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          mockChangeStream.emit('change', changeEvent);
          resolve();
        }, 10);
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      const resumeToken = cdcService.getResumeToken();
      expect(resumeToken).toEqual({ _data: 'resume-token-123' });
    });
  });

  describe('event handlers', () => {
    let handler: CdcEventHandler<TestDocument>;

    beforeEach(() => {
      handler = {
        onEvent: jest.fn(),
        onError: jest.fn(),
        onClose: jest.fn(),
      };
    });

    it('should register and notify handlers', async () => {
      cdcService.registerHandler(handler);
      await cdcService.start();

      const changeEvent = {
        _id: { _data: 'token123' },
        operationType: 'insert',
        documentKey: { _id: '123' },
        fullDocument: { _id: '123', name: 'test', value: 42 },
        ns: { db: 'testdb', coll: 'testcoll' },
        clusterTime: new Date(),
      };

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          mockChangeStream.emit('change', changeEvent);
          resolve();
        }, 10);
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(handler.onEvent).toHaveBeenCalled();
    });

    it('should unregister handlers', () => {
      cdcService.registerHandler(handler);
      cdcService.unregisterHandler(handler);

      // Handler should not be called after unregistering
      expect(handler.onEvent).not.toHaveBeenCalled();
    });

    it('should call onError handler on error', async () => {
      cdcService.registerHandler(handler);
      await cdcService.start();

      const error = new Error('Test error');
      mockChangeStream.emit('error', error);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(handler.onError).toHaveBeenCalledWith(error);
    });

    it('should call onClose handler on close', async () => {
      cdcService.registerHandler(handler);
      await cdcService.start();

      mockChangeStream.emit('close');

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(handler.onClose).toHaveBeenCalled();
    });
  });

  describe('reconnection', () => {
    it('should not reconnect when autoReconnect is false', async () => {
      const options: CdcServiceOptions = { autoReconnect: false };
      cdcService = new TestCdcService(mockModel, options);

      await cdcService.start();
      const watchCallCount = mockModel.watch.mock.calls.length;

      mockChangeStream.emit('error', new Error('Connection lost'));

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should not have called watch again
      expect(mockModel.watch).toHaveBeenCalledTimes(watchCallCount);
    });

    it('should attempt reconnection when autoReconnect is true', async () => {
      const options: CdcServiceOptions = {
        autoReconnect: true,
        reconnectDelay: 10,
        maxReconnectAttempts: 1,
      };
      cdcService = new TestCdcService(mockModel, options);

      await cdcService.start();
      const initialCallCount = mockModel.watch.mock.calls.length;

      // Create a fresh mock for the reconnection attempt
      const newMockChangeStream: any = new EventEmitter();
      (newMockChangeStream as any).close = jest.fn().mockResolvedValue(undefined);
      mockModel.watch.mockReturnValueOnce(newMockChangeStream);

      mockChangeStream.emit('close');

      // Wait for reconnection attempt
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Should have attempted to reconnect
      expect(mockModel.watch.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  describe('onModuleDestroy', () => {
    it('should stop watching on module destroy', async () => {
      await cdcService.start();
      await cdcService.onModuleDestroy();

      expect(mockChangeStream.close).toHaveBeenCalled();
      expect(cdcService.isWatching()).toBe(false);
    });
  });
});
