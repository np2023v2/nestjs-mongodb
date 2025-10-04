import * as mongoose from 'mongoose';
import {
  isValidObjectId,
  toObjectId,
  toObjectIdString,
  generateObjectId,
  isConnectionReady,
} from '../src/utils/connection.utils';

describe('Connection Utils', () => {
  describe('isValidObjectId', () => {
    it('should return true for valid ObjectId string', () => {
      const validId = new mongoose.Types.ObjectId().toString();
      expect(isValidObjectId(validId)).toBe(true);
    });

    it('should return false for invalid ObjectId string', () => {
      expect(isValidObjectId('invalid-id')).toBe(false);
      expect(isValidObjectId('12345')).toBe(false);
      expect(isValidObjectId('')).toBe(false);
    });
  });

  describe('toObjectId', () => {
    it('should convert string to ObjectId', () => {
      const id = new mongoose.Types.ObjectId().toString();
      const objectId = toObjectId(id);
      expect(objectId).toBeInstanceOf(mongoose.Types.ObjectId);
      expect(objectId.toString()).toBe(id);
    });
  });

  describe('toObjectIdString', () => {
    it('should convert ObjectId to string', () => {
      const objectId = new mongoose.Types.ObjectId();
      const idString = toObjectIdString(objectId);
      expect(typeof idString).toBe('string');
      expect(idString).toBe(objectId.toString());
    });
  });

  describe('generateObjectId', () => {
    it('should generate new ObjectId', () => {
      const objectId = generateObjectId();
      expect(objectId).toBeInstanceOf(mongoose.Types.ObjectId);
    });

    it('should generate unique ObjectIds', () => {
      const id1 = generateObjectId();
      const id2 = generateObjectId();
      expect(id1.toString()).not.toBe(id2.toString());
    });
  });

  describe('isConnectionReady', () => {
    it('should return true for connected state', () => {
      const mockConnection = { readyState: 1 } as mongoose.Connection;
      expect(isConnectionReady(mockConnection)).toBe(true);
    });

    it('should return false for disconnected state', () => {
      const mockConnection = { readyState: 0 } as mongoose.Connection;
      expect(isConnectionReady(mockConnection)).toBe(false);
    });

    it('should return false for connecting state', () => {
      const mockConnection = { readyState: 2 } as mongoose.Connection;
      expect(isConnectionReady(mockConnection)).toBe(false);
    });
  });
});
