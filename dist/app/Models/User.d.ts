import { Model } from './Model';
/**
 * User Model
 * Represents a user in the system
 */
export declare class User extends Model {
    name: string;
    email: string;
    password: string;
    avatar?: string;
    email_verified_at?: Date;
    is_active: boolean;
    /**
     * Get the user's full name
     */
    getFullName(): string;
    /**
     * Check if user's email is verified
     */
    isEmailVerified(): boolean;
    /**
     * Get user data for API response (hide sensitive fields)
     */
    toJSON(): Record<string, any>;
}
//# sourceMappingURL=User.d.ts.map