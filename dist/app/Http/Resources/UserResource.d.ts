import { Resource } from './Resource';
/**
 * User Resource
 * Transforms user data for API responses
 */
export declare class UserResource extends Resource {
    /**
     * Transform the user data
     */
    transform(): Record<string, any>;
    /**
     * Transform user data for public API (minimal information)
     */
    toPublic(): Record<string, any>;
    /**
     * Transform user data for profile API (detailed information)
     */
    toProfile(): Record<string, any>;
}
//# sourceMappingURL=UserResource.d.ts.map