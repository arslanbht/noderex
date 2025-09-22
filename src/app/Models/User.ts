import { Entity, Column, Index } from 'typeorm';
import { Model } from './Model';

/**
 * User Model
 * Represents a user in the system
 */
@Entity('users')
@Index(['email'], { unique: true })
export class User extends Model {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar?: string;

  @Column({ type: 'timestamp', nullable: true })
  email_verified_at?: Date;

  @Column({ type: 'boolean', default: false })
  is_active!: boolean;

  /**
   * Get the user's full name
   */
  public getFullName(): string {
    return this.name;
  }

  /**
   * Check if user's email is verified
   */
  public isEmailVerified(): boolean {
    return this.email_verified_at !== null;
  }

  /**
   * Get user data for API response (hide sensitive fields)
   */
  public toJSON(): Record<string, any> {
    return this.hidden(['password']);
  }
}
