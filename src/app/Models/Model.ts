import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity, getRepository } from 'typeorm';
import 'reflect-metadata';
import { HasMany } from './Relations/HasMany';
import { BelongsTo } from './Relations/BelongsTo';
import { HasOne } from './Relations/HasOne';
import { BelongsToMany } from './Relations/BelongsToMany';
import { MorphTo } from './Relations/MorphTo';
import { MorphOne } from './Relations/MorphOne';
import { MorphMany } from './Relations/MorphMany';
import { MorphToMany } from './Relations/MorphToMany';
import { MorphedByMany } from './Relations/MorphedByMany';

/**
 * Base Model class for NodeRex framework
 * Provides common functionality for all models including timestamps and relationships
 */
@Entity()
export abstract class Model extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  /**
   * Get repository for this model
   */
  public static getRepository() {
    return getRepository(this);
  }

  /**
   * Fill the model with an array of attributes
   */
  public fill(attributes: Record<string, any>): this {
    Object.keys(attributes).forEach(key => {
      if (key in this) {
        (this as any)[key] = attributes[key];
      }
    });
    return this;
  }

  /**
   * Convert the model instance to JSON
   * Includes all properties including TypeORM columns
   */
  public toJSON(): Record<string, any> {
    const json: Record<string, any> = {};
    // Get all own properties (including TypeORM columns)
    const allKeys = Object.getOwnPropertyNames(this);
    
    allKeys.forEach(key => {
      // Skip internal TypeORM properties
      if (key.startsWith('__') || key === 'hasId' || key === 'save' || key === 'remove' || key === 'softRemove' || key === 'recover' || key === 'reload') {
        return;
      }
      
      const value = (this as any)[key];
      if (value !== undefined) {
        // Handle functions - skip them in JSON
        if (typeof value !== 'function') {
          json[key] = value;
        }
      }
    });
    
    return json;
  }

  /**
   * Get only specified attributes from the model
   */
  public only(attributes: string[]): Record<string, any> {
    const result: Record<string, any> = {};
    attributes.forEach(attr => {
      if (attr in this) {
        result[attr] = (this as any)[attr];
      }
    });
    return result;
  }

  /**
   * Hide specified attributes from JSON output
   */
  public hidden(attributes: string[]): Record<string, any> {
    const json = this.toJSON();
    attributes.forEach(attr => {
      delete json[attr];
    });
    return json;
  }

  /**
   * Define a has-many relationship
   * @example this.posts = this.hasMany(Post, 'user_id')
   */
  public hasMany<T extends Model>(
    related: new () => T,
    foreignKey?: string,
    localKey: string = 'id'
  ): HasMany<T> {
    return new HasMany(this, related, foreignKey, localKey);
  }

  /**
   * Define a belongs-to relationship
   * @example this.user = this.belongsTo(User, 'user_id')
   */
  public belongsTo<T extends Model>(
    related: new () => T,
    foreignKey?: string,
    ownerKey: string = 'id'
  ): BelongsTo<T> {
    return new BelongsTo(this, related, foreignKey, ownerKey);
  }

  /**
   * Define a has-one relationship
   * @example this.profile = this.hasOne(Profile, 'user_id')
   */
  public hasOne<T extends Model>(
    related: new () => T,
    foreignKey?: string,
    localKey: string = 'id'
  ): HasOne<T> {
    return new HasOne(this, related, foreignKey, localKey);
  }

  /**
   * Define a belongs-to-many relationship
   * @example this.roles = this.belongsToMany(Role, 'user_roles', 'user_id', 'role_id')
   */
  public belongsToMany<T extends Model>(
    related: new () => T,
    pivotTable: string,
    foreignPivotKey?: string,
    relatedPivotKey?: string,
    parentKey: string = 'id',
    relatedKey: string = 'id'
  ): BelongsToMany<T> {
    return new BelongsToMany(
      this,
      related,
      pivotTable,
      foreignPivotKey,
      relatedPivotKey,
      parentKey,
      relatedKey
    );
  }

  /**
   * Define a morph-to relationship (polymorphic belongs-to)
   * @example this.commentable = this.morphTo('commentable_type', 'commentable_id')
   */
  public morphTo<T extends Model>(
    morphTypeColumn: string = 'morphable_type',
    morphIdColumn: string = 'morphable_id',
    morphMap?: Record<string, new () => T>
  ): MorphTo<T> {
    return new MorphTo(this, morphTypeColumn, morphIdColumn, morphMap);
  }

  /**
   * Define a morph-one relationship (polymorphic one-to-one)
   * @example this.image = this.morphOne(Image, 'imageable_type', 'imageable_id')
   */
  public morphOne<T extends Model>(
    related: new () => T,
    morphTypeColumn: string = 'morphable_type',
    morphIdColumn: string = 'morphable_id',
    localKey: string = 'id'
  ): MorphOne<T> {
    return new MorphOne(this, related, morphTypeColumn, morphIdColumn, localKey);
  }

  /**
   * Define a morph-many relationship (polymorphic one-to-many)
   * @example this.comments = this.morphMany(Comment, 'commentable_type', 'commentable_id')
   */
  public morphMany<T extends Model>(
    related: new () => T,
    morphTypeColumn: string = 'morphable_type',
    morphIdColumn: string = 'morphable_id',
    localKey: string = 'id'
  ): MorphMany<T> {
    return new MorphMany(this, related, morphTypeColumn, morphIdColumn, localKey);
  }

  /**
   * Define a morph-to-many relationship (polymorphic many-to-many)
   * @example this.tags = this.morphToMany(Tag, 'taggables', 'taggable_type', 'taggable_id')
   */
  public morphToMany<T extends Model>(
    related: new () => T,
    pivotTable: string,
    morphTypeColumn: string = 'morphable_type',
    morphIdColumn: string = 'morphable_id',
    foreignPivotKey?: string,
    relatedPivotKey?: string,
    parentKey: string = 'id',
    relatedKey: string = 'id'
  ): MorphToMany<T> {
    return new MorphToMany(
      this,
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
   * Define a morphed-by-many relationship (inverse of morph-to-many)
   * @example this.posts = this.morphedByMany(Post, 'taggables', 'taggable_type', 'taggable_id')
   */
  public morphedByMany<T extends Model>(
    related: new () => T,
    pivotTable: string,
    morphTypeColumn: string = 'morphable_type',
    morphIdColumn: string = 'morphable_id',
    foreignPivotKey?: string,
    relatedPivotKey?: string,
    parentKey: string = 'id',
    relatedKey: string = 'id'
  ): MorphedByMany<T> {
    return new MorphedByMany(
      this,
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
   * Global scopes registry
   */
  private static globalScopes: Map<string, (query: any) => any> = new Map();

  /**
   * Local scopes registry
   */
  private localScopes: Map<string, (query: any) => any> = new Map();

  /**
   * Add a global scope
   */
  public static addGlobalScope(name: string, scope: (query: any) => any): void {
    this.globalScopes.set(name, scope);
  }

  /**
   * Remove a global scope
   */
  public static removeGlobalScope(name: string): void {
    this.globalScopes.delete(name);
  }

  /**
   * Add a local scope
   */
  public addScope(name: string, scope: (query: any) => any): void {
    this.localScopes.set(name, scope);
  }

  /**
   * Apply scopes to query builder
   */
  public static applyScopes(queryBuilder: any): any {
    let query = queryBuilder;
    
    // Apply global scopes
    this.globalScopes.forEach((scope) => {
      query = scope(query);
    });
    
    return query;
  }

  /**
   * Apply local scopes to query builder
   */
  public applyLocalScopes(queryBuilder: any): any {
    let query = queryBuilder;
    
    // Apply local scopes
    this.localScopes.forEach((scope) => {
      query = scope(query);
    });
    
    return query;
  }

  /**
   * Query builder with scopes applied
   */
  public static query(): any {
    const repository = this.getRepository();
    let queryBuilder = repository.createQueryBuilder();
    
    // Apply global scopes
    queryBuilder = this.applyScopes(queryBuilder);
    
    return queryBuilder;
  }

  /**
   * Scope query
   */
  public static scope(scopeName: string, ...args: any[]): any {
    const repository = this.getRepository();
    let queryBuilder = repository.createQueryBuilder();
    
    // Apply global scopes first
    queryBuilder = this.applyScopes(queryBuilder);
    
    // Apply named scope if it exists as a static method
    if (typeof (this as any)[scopeName] === 'function') {
      queryBuilder = (this as any)[scopeName](queryBuilder, ...args);
    }
    
    return queryBuilder;
  }

  /**
   * Get query builder without global scopes
   */
  public static withoutGlobalScopes(...scopeNames: string[]): any {
    const repository = this.getRepository();
    const queryBuilder = repository.createQueryBuilder();
    
    // If specific scopes are provided, exclude only those
    if (scopeNames.length > 0) {
      const scopesToApply = new Map(this.globalScopes);
      scopeNames.forEach(name => scopesToApply.delete(name));
      
      let query = queryBuilder;
      scopesToApply.forEach((scope) => {
        query = scope(query);
      });
      return query;
    }
    
    // Otherwise, return query without any global scopes
    return queryBuilder;
  }
}
