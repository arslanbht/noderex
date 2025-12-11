import { Model } from '../Model';
import { MorphToMany } from './MorphToMany';

/**
 * MorphedByMany relationship class
 * Represents the inverse of a many-to-many polymorphic relationship
 * This is the "other side" of MorphToMany
 */
export class MorphedByMany<T extends Model> {
  private morphToMany: MorphToMany<T>;

  constructor(
    parent: Model,
    related: new () => T,
    pivotTable: string,
    morphTypeColumn: string = 'morphable_type',
    morphIdColumn: string = 'morphable_id',
    foreignPivotKey?: string,
    relatedPivotKey?: string,
    parentKey: string = 'id',
    relatedKey: string = 'id'
  ) {
    // MorphedByMany is essentially the same as MorphToMany
    // but from the perspective of the related model
    this.morphToMany = new MorphToMany(
      parent,
      related,
      pivotTable,
      morphTypeColumn,
      morphIdColumn,
      foreignPivotKey,
      relatedPivotKey,
      parentKey,
      relatedKey
    );
  }

  /**
   * Get all related models
   */
  public async get(): Promise<T[]> {
    return await this.morphToMany.get();
  }

  /**
   * Get count of related models
   */
  public async count(): Promise<number> {
    return await this.morphToMany.count();
  }

  /**
   * Attach related models
   */
  public async attach(models: T[] | number[], pivotAttributes?: Record<string, any>): Promise<void> {
    return await this.morphToMany.attach(models, pivotAttributes);
  }

  /**
   * Detach related models
   */
  public async detach(models?: T[] | number[]): Promise<void> {
    return await this.morphToMany.detach(models);
  }

  /**
   * Sync related models
   */
  public async sync(models: T[] | number[], detaching: boolean = true): Promise<void> {
    return await this.morphToMany.sync(models, detaching);
  }

  /**
   * Toggle related models
   */
  public async toggle(models: T[] | number[]): Promise<void> {
    return await this.morphToMany.toggle(models);
  }
}
