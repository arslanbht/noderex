import { BaseEntity } from 'typeorm';
import 'reflect-metadata';
/**
 * Base Model class for NodeRex framework
 * Provides common functionality for all models including timestamps
 */
export declare abstract class Model extends BaseEntity {
    id: number;
    created_at: Date;
    updated_at: Date;
    /**
     * Fill the model with an array of attributes
     */
    fill(attributes: Record<string, any>): this;
    /**
     * Convert the model instance to JSON
     */
    toJSON(): Record<string, any>;
    /**
     * Get only specified attributes from the model
     */
    only(attributes: string[]): Record<string, any>;
    /**
     * Hide specified attributes from JSON output
     */
    hidden(attributes: string[]): Record<string, any>;
}
//# sourceMappingURL=Model.d.ts.map