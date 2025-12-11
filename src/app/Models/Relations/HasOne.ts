import { Model } from '../Model';
import { HasMany } from './HasMany';

/**
 * HasOne relationship class
 * Represents a one-to-one relationship
 * Uses HasMany internally but returns a single model
 */
export class HasOne<T extends Model> {
  private hasMany: HasMany<T>;

  constructor(
    parent: Model,
    related: new () => T,
    foreignKey?: string,
    localKey: string = 'id'
  ) {
    this.hasMany = new HasMany(parent, related, foreignKey, localKey);
  }

  /**
   * Get the related model
   */
  public async get(): Promise<T | null> {
    const results = await this.hasMany.get();
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Create a new related model
   */
  public async create(attributes: Partial<T>): Promise<T> {
    return await this.hasMany.create(attributes);
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
