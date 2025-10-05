import { AggregateBuilder, createAggregateBuilder } from '../src/utils/aggregate.utils';

describe('Aggregate Utils', () => {
  describe('AggregateBuilder', () => {
    let builder: AggregateBuilder;

    beforeEach(() => {
      builder = new AggregateBuilder();
    });

    describe('match', () => {
      it('should add a $match stage', () => {
        const pipeline = builder.match({ status: 'active' }).build();
        expect(pipeline).toEqual([{ $match: { status: 'active' } }]);
      });

      it('should add multiple $match stages', () => {
        const pipeline = builder
          .match({ status: 'active' })
          .match({ age: { $gte: 18 } })
          .build();
        expect(pipeline).toEqual([
          { $match: { status: 'active' } },
          { $match: { age: { $gte: 18 } } },
        ]);
      });
    });

    describe('group', () => {
      it('should add a $group stage', () => {
        const pipeline = builder
          .group({
            _id: '$status',
            count: { $sum: 1 },
          })
          .build();
        expect(pipeline).toEqual([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]);
      });
    });

    describe('sort', () => {
      it('should add a $sort stage', () => {
        const pipeline = builder.sort({ createdAt: -1, name: 1 }).build();
        expect(pipeline).toEqual([{ $sort: { createdAt: -1, name: 1 } }]);
      });
    });

    describe('project', () => {
      it('should add a $project stage', () => {
        const pipeline = builder
          .project({
            name: 1,
            email: 1,
            age: 1,
          })
          .build();
        expect(pipeline).toEqual([
          {
            $project: {
              name: 1,
              email: 1,
              age: 1,
            },
          },
        ]);
      });
    });

    describe('limit', () => {
      it('should add a $limit stage', () => {
        const pipeline = builder.limit(10).build();
        expect(pipeline).toEqual([{ $limit: 10 }]);
      });
    });

    describe('skip', () => {
      it('should add a $skip stage', () => {
        const pipeline = builder.skip(20).build();
        expect(pipeline).toEqual([{ $skip: 20 }]);
      });
    });

    describe('lookup', () => {
      it('should add a $lookup stage', () => {
        const pipeline = builder
          .lookup({
            from: 'orders',
            localField: '_id',
            foreignField: 'userId',
            as: 'userOrders',
          })
          .build();
        expect(pipeline).toEqual([
          {
            $lookup: {
              from: 'orders',
              localField: '_id',
              foreignField: 'userId',
              as: 'userOrders',
            },
          },
        ]);
      });
    });

    describe('unwind', () => {
      it('should add an $unwind stage with string path', () => {
        const pipeline = builder.unwind('$tags').build();
        expect(pipeline).toEqual([{ $unwind: '$tags' }]);
      });

      it('should add an $unwind stage with options', () => {
        const pipeline = builder
          .unwind({
            path: '$tags',
            preserveNullAndEmptyArrays: true,
          })
          .build();
        expect(pipeline).toEqual([
          {
            $unwind: {
              path: '$tags',
              preserveNullAndEmptyArrays: true,
            },
          },
        ]);
      });
    });

    describe('count', () => {
      it('should add a $count stage', () => {
        const pipeline = builder.count('total').build();
        expect(pipeline).toEqual([{ $count: 'total' }]);
      });
    });

    describe('addFields', () => {
      it('should add an $addFields stage', () => {
        const pipeline = builder
          .addFields({
            fullName: { $concat: ['$firstName', ' ', '$lastName'] },
            isAdult: { $gte: ['$age', 18] },
          })
          .build();
        expect(pipeline).toEqual([
          {
            $addFields: {
              fullName: { $concat: ['$firstName', ' ', '$lastName'] },
              isAdult: { $gte: ['$age', 18] },
            },
          },
        ]);
      });
    });

    describe('addStage', () => {
      it('should add a custom stage', () => {
        const pipeline = builder
          .addStage({
            $facet: {
              categorizedByStatus: [{ $match: { status: 'active' } }],
              categorizedByAge: [{ $match: { age: { $gte: 18 } } }],
            },
          })
          .build();
        expect(pipeline).toEqual([
          {
            $facet: {
              categorizedByStatus: [{ $match: { status: 'active' } }],
              categorizedByAge: [{ $match: { age: { $gte: 18 } } }],
            },
          },
        ]);
      });
    });

    describe('chaining', () => {
      it('should support method chaining for complex pipelines', () => {
        const pipeline = builder
          .match({ status: 'active' })
          .group({
            _id: '$category',
            count: { $sum: 1 },
            avgAge: { $avg: '$age' },
          })
          .sort({ count: -1 })
          .limit(5)
          .build();

        expect(pipeline).toEqual([
          { $match: { status: 'active' } },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              avgAge: { $avg: '$age' },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]);
      });

      it('should build a pagination pipeline', () => {
        const page = 2;
        const limit = 10;
        const skip = (page - 1) * limit;

        const pipeline = builder
          .match({ isActive: true })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .build();

        expect(pipeline).toEqual([
          { $match: { isActive: true } },
          { $sort: { createdAt: -1 } },
          { $skip: 10 },
          { $limit: 10 },
        ]);
      });

      it('should build a lookup with unwind pipeline', () => {
        const pipeline = builder
          .match({ status: 'active' })
          .lookup({
            from: 'orders',
            localField: '_id',
            foreignField: 'userId',
            as: 'orders',
          })
          .unwind('$orders')
          .group({
            _id: '$_id',
            totalOrders: { $sum: 1 },
            totalAmount: { $sum: '$orders.amount' },
          })
          .build();

        expect(pipeline).toHaveLength(4);
        expect(pipeline[0]).toEqual({ $match: { status: 'active' } });
        expect(pipeline[1]).toEqual({
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'userId',
            as: 'orders',
          },
        });
        expect(pipeline[2]).toEqual({ $unwind: '$orders' });
        expect(pipeline[3]).toEqual({
          $group: {
            _id: '$_id',
            totalOrders: { $sum: 1 },
            totalAmount: { $sum: '$orders.amount' },
          },
        });
      });
    });

    describe('reset', () => {
      it('should reset the pipeline', () => {
        builder.match({ status: 'active' }).sort({ createdAt: -1 });
        expect(builder.build()).toHaveLength(2);

        builder.reset();
        expect(builder.build()).toEqual([]);
      });

      it('should allow reusing the builder after reset', () => {
        builder.match({ status: 'active' }).build();
        builder.reset();
        const pipeline = builder.match({ status: 'inactive' }).build();
        expect(pipeline).toEqual([{ $match: { status: 'inactive' } }]);
      });
    });
  });

  describe('createAggregateBuilder', () => {
    it('should create a new AggregateBuilder instance', () => {
      const builder = createAggregateBuilder();
      expect(builder).toBeInstanceOf(AggregateBuilder);
    });

    it('should create independent instances', () => {
      const builder1 = createAggregateBuilder();
      const builder2 = createAggregateBuilder();

      builder1.match({ status: 'active' });
      builder2.match({ status: 'inactive' });

      expect(builder1.build()).toEqual([{ $match: { status: 'active' } }]);
      expect(builder2.build()).toEqual([{ $match: { status: 'inactive' } }]);
    });
  });
});
