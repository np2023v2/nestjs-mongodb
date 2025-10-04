import {
  buildTextSearchQuery,
  buildDateRangeQuery,
  buildFilterQuery,
  mergeFilterQueries,
  buildProjection,
  buildSortObject,
} from '../src/utils/query.utils';

describe('Query Utils', () => {
  describe('buildTextSearchQuery', () => {
    it('should build a text search query for multiple fields', () => {
      const query = buildTextSearchQuery('john', ['name', 'email']);
      expect(query).toHaveProperty('$or');
      expect(query.$or).toHaveLength(2);
    });

    it('should return empty object for empty search text', () => {
      const query = buildTextSearchQuery('', ['name', 'email']);
      expect(query).toEqual({});
    });

    it('should return empty object for empty fields', () => {
      const query = buildTextSearchQuery('john', []);
      expect(query).toEqual({});
    });
  });

  describe('buildDateRangeQuery', () => {
    it('should build date range query with both dates', () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      const query = buildDateRangeQuery('createdAt', startDate, endDate);

      expect(query.createdAt).toHaveProperty('$gte', startDate);
      expect(query.createdAt).toHaveProperty('$lte', endDate);
    });

    it('should build date range query with only start date', () => {
      const startDate = new Date('2023-01-01');
      const query = buildDateRangeQuery('createdAt', startDate);

      expect(query.createdAt).toHaveProperty('$gte', startDate);
      expect(query.createdAt).not.toHaveProperty('$lte');
    });

    it('should build date range query with only end date', () => {
      const endDate = new Date('2023-12-31');
      const query = buildDateRangeQuery('createdAt', undefined, endDate);

      expect(query.createdAt).toHaveProperty('$lte', endDate);
      expect(query.createdAt).not.toHaveProperty('$gte');
    });

    it('should return empty object when no dates provided', () => {
      const query = buildDateRangeQuery('createdAt');
      expect(query).toEqual({});
    });
  });

  describe('buildFilterQuery', () => {
    it('should handle simple values', () => {
      const query = buildFilterQuery({ status: 'active', isVerified: true });
      expect(query).toEqual({ status: 'active', isVerified: true });
    });

    it('should handle array values with $in operator', () => {
      const query = buildFilterQuery({ status: ['active', 'pending'] });
      expect(query.status).toEqual({ $in: ['active', 'pending'] });
    });

    it('should handle min/max range objects', () => {
      const query = buildFilterQuery({ age: { min: 18, max: 65 } });
      expect(query.age).toEqual({ $gte: 18, $lte: 65 });
    });

    it('should skip undefined, null, and empty string values', () => {
      const query = buildFilterQuery({
        name: 'John',
        age: undefined,
        email: null,
        phone: '',
      });
      expect(query).toEqual({ name: 'John' });
    });
  });

  describe('mergeFilterQueries', () => {
    it('should merge multiple queries with $and', () => {
      const query1 = { status: 'active' };
      const query2 = { age: { $gte: 18 } };
      const merged = mergeFilterQueries(query1, query2);

      expect(merged).toHaveProperty('$and');
      expect(merged.$and).toHaveLength(2);
    });

    it('should return single query without $and wrapper', () => {
      const query1 = { status: 'active' };
      const merged = mergeFilterQueries(query1);

      expect(merged).toEqual({ status: 'active' });
    });

    it('should return empty object for no queries', () => {
      const merged = mergeFilterQueries();
      expect(merged).toEqual({});
    });

    it('should skip empty queries', () => {
      const query1 = { status: 'active' };
      const query2 = {};
      const merged = mergeFilterQueries(query1, query2);

      expect(merged).toEqual({ status: 'active' });
    });
  });

  describe('buildProjection', () => {
    it('should build projection object', () => {
      const projection = buildProjection(['name', 'email', 'age']);
      expect(projection).toEqual({ name: 1, email: 1, age: 1 });
    });

    it('should return empty object for empty fields', () => {
      const projection = buildProjection([]);
      expect(projection).toEqual({});
    });
  });

  describe('buildSortObject', () => {
    it('should build sort object with ascending fields', () => {
      const sort = buildSortObject(['name', 'age']);
      expect(sort).toEqual({ name: 1, age: 1 });
    });

    it('should build sort object with descending fields', () => {
      const sort = buildSortObject(['-createdAt', '-updatedAt']);
      expect(sort).toEqual({ createdAt: -1, updatedAt: -1 });
    });

    it('should build sort object with mixed fields', () => {
      const sort = buildSortObject(['name', '-createdAt', 'age']);
      expect(sort).toEqual({ name: 1, createdAt: -1, age: 1 });
    });

    it('should return empty object for empty fields', () => {
      const sort = buildSortObject([]);
      expect(sort).toEqual({});
    });
  });
});
