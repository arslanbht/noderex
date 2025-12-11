import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity } from 'typeorm';
import 'reflect-metadata';

/**
 * Base Model class for NodeRex framework
 * Provides common functionality for all models including timestamps
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
}
