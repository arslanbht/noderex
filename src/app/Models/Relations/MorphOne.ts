import { Model } from '../Model';
import { MorphMany } from './MorphMany';

/**
 * MorphOne relationship class
 * Represents a one-to-one polymorphic relationship
 * Uses MorphMany internally but returns a single model
 */
export class MorphOne<T extends Model> {
  private morphMany: MorphMany<T>;

  constructor(
    parent: Model,
    related: new () => T,
    morphTypeColumn: string = 'morphable_type',
    morphIdColumn: string = 'morphable_id',
    localKey: string = 'id'
  ) {
    this.morphMany = new MorphMany(parent, related, morphTypeColumn, morphIdColumn, localKey);
  }

  /**
   * Get the related model
   */
  public async get(): Promise<T | null> {
    const results = await this.morphMany.get();
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Create a new related model
   */
  public async create(attributes: Partial<T>): Promise<T> {
    return await this.morphMany.create(attributes);
  }

  /**
   * Update or create related model
   */
  public async updateOrCreate(attributes: Partial<T>, values?: Partial<T>): Promise<T> {
    const existing = await this.get();
    if (existing) {
      Object.assign(existing, values || attributes);
      return await existing.save() as T;
    } else {
      return await this.create(attributes);
    }
  }
}
