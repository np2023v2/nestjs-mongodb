import { PipelineStage } from 'mongoose';

/**
 * Fluent builder for MongoDB aggregation pipelines
 */
export class AggregateBuilder {
  private pipeline: PipelineStage[] = [];

  /**
   * Add a $match stage to filter documents
   */
  match(filter: Record<string, any>): this {
    this.pipeline.push({ $match: filter });
    return this;
  }

  /**
   * Add a $group stage to group documents
   */
  group(groupBy: Record<string, any>): this {
    this.pipeline.push({ $group: groupBy });
    return this;
  }

  /**
   * Add a $sort stage to sort documents
   */
  sort(sortBy: Record<string, 1 | -1>): this {
    this.pipeline.push({ $sort: sortBy });
    return this;
  }

  /**
   * Add a $project stage to reshape documents
   */
  project(projection: Record<string, any>): this {
    this.pipeline.push({ $project: projection });
    return this;
  }

  /**
   * Add a $limit stage to limit number of documents
   */
  limit(count: number): this {
    this.pipeline.push({ $limit: count });
    return this;
  }

  /**
   * Add a $skip stage to skip documents
   */
  skip(count: number): this {
    this.pipeline.push({ $skip: count });
    return this;
  }

  /**
   * Add a $lookup stage to perform a join
   */
  lookup(options: { from: string; localField: string; foreignField: string; as: string }): this {
    this.pipeline.push({ $lookup: options });
    return this;
  }

  /**
   * Add an $unwind stage to deconstruct arrays
   */
  unwind(path: string | { path: string; preserveNullAndEmptyArrays?: boolean }): this {
    this.pipeline.push({ $unwind: path });
    return this;
  }

  /**
   * Add a $count stage to count documents
   */
  count(fieldName: string): this {
    this.pipeline.push({ $count: fieldName });
    return this;
  }

  /**
   * Add a $addFields stage to add new fields
   */
  addFields(fields: Record<string, any>): this {
    this.pipeline.push({ $addFields: fields });
    return this;
  }

  /**
   * Add a custom pipeline stage
   */
  addStage(stage: PipelineStage): this {
    this.pipeline.push(stage);
    return this;
  }

  /**
   * Get the built pipeline
   */
  build(): PipelineStage[] {
    return this.pipeline;
  }

  /**
   * Reset the pipeline
   */
  reset(): this {
    this.pipeline = [];
    return this;
  }
}

/**
 * Create a new aggregate builder instance
 */
export function createAggregateBuilder(): AggregateBuilder {
  return new AggregateBuilder();
}
