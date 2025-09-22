import { Request, Validation } from 'noderex';

/**
 * CreateUserRequest
 */
export class CreateUserRequest extends Request {
    // Add your properties here
    // Example:
    // public name!: string;
    // public email!: string;

    /**
     * Get validation rules
     */
    public rules(): Record<string, any> {
        return {
            // Add your validation rules here
            // Example:
            // name: [
            //     Validation.required('Name is required'),
            //     Validation.min(2, 'Name must be at least 2 characters')
            // ]
        };
    }

    /**
     * Custom validation messages
     */
    public messages(): Record<string, string> {
        return {
            // Add your custom messages here
        };
    }

    /**
     * Custom attribute names for validation messages
     */
    public attributes(): Record<string, string> {
        return {
            // Add your attribute names here
        };
    }
}
