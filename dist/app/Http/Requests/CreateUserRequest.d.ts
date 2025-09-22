import { Request } from './Request';
/**
 * Create User Request
 * Validates user creation data
 */
export declare class CreateUserRequest extends Request {
    name: string;
    email: string;
    password: string;
    password_confirmation?: string;
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
//# sourceMappingURL=CreateUserRequest.d.ts.map