import { Entity, Column, Index } from 'typeorm';
import { Model } from './Model';

/**
 * TestModel Model
 */
@Entity('testmodels')
export class TestModel extends Model {
    // Add your columns here
    // Example:
    // @Column({ type: 'varchar', length: 255 })
    // name!: string;
}
