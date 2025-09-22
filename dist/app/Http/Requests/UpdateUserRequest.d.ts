import { Request } from './Request';
/**
 * Update User Request
 * Validates user update data
 */
export declare class UpdateUserRequest extends Request {
    name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
    avatar?: string;
    /**
     * Get validation rules
     */
    rules(): Record<string, any>;
    /**
     * Custom validation messages
     */
    messages(): Record<string, string>;
    /**
     * Custom attribute names for validation messages
     */
    attributes(): Record<string, string>;
}
//# sourceMappingURL=UpdateUserRequest.d.ts.map