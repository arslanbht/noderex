"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserRequest = void 0;
const Request_1 = require("./Request");
const Request_2 = require("./Request");
/**
 * Create User Request
 * Validates user creation data
 */
class CreateUserRequest extends Request_1.Request {
    /**
     * Get validation rules
     */
    rules() {
        return {
            name: [
                Request_2.Validation.required('Name is required'),
                Request_2.Validation.min(2, 'Name must be at least 2 characters'),
                Request_2.Validation.max(255, 'Name must not exceed 255 characters')
            ],
            email: [
                Request_2.Validation.required('Email is required'),
                Request_2.Validation.email('Email must be a valid email address'),
                Request_2.Validation.max(255, 'Email must not exceed 255 characters'),
                Request_2.Validation.unique('users', 'email', 'Email already exists')
            ],
            password: [
                Request_2.Validation.required('Password is required'),
                Request_2.Validation.min(8, 'Password must be at least 8 characters'),
                Request_2.Validation.confirmed('Password confirmation does not match')
            ],
            password_confirmation: [
                Request_2.Validation.required('Password confirmation is required')
            ]
        };
    }
    /**
     * Custom validation messages
     */
    messages() {
        return {
            'name.required': 'The name field is required.',
            'name.min': 'The name must be at least 2 characters.',
            'name.max': 'The name may not be greater than 255 characters.',
            'email.required': 'The email field is required.',
            'email.email': 'The email must be a valid email address.',
            'email.unique': 'The email has already been taken.',
            'password.required': 'The password field is required.',
            'password.min': 'The password must be at least 8 characters.',
            'password.confirmed': 'The password confirmation does not match.',
            'password_confirmation.required': 'The password confirmation field is required.'
        };
    }
    /**
     * Custom attribute names for validation messages
     */
    attributes() {
        return {
            name: 'Name',
            email: 'Email',
            password: 'Password',
            password_confirmation: 'Password Confirmation'
        };
    }
}
exports.CreateUserRequest = CreateUserRequest;
//# sourceMappingURL=CreateUserRequest.js.map