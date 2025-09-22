"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserRequest = void 0;
const Request_1 = require("./Request");
const Request_2 = require("./Request");
/**
 * Update User Request
 * Validates user update data
 */
class UpdateUserRequest extends Request_1.Request {
    /**
     * Get validation rules
     */
    rules() {
        return {
            name: [
                Request_2.Validation.min(2, 'Name must be at least 2 characters'),
                Request_2.Validation.max(255, 'Name must not exceed 255 characters')
            ],
            email: [
                Request_2.Validation.email('Email must be a valid email address'),
                Request_2.Validation.max(255, 'Email must not exceed 255 characters')
            ],
            password: [
                Request_2.Validation.min(8, 'Password must be at least 8 characters'),
                Request_2.Validation.confirmed('Password confirmation does not match')
            ],
            password_confirmation: [
                Request_2.Validation.required('Password confirmation is required when password is provided')
            ],
            avatar: [
                Request_2.Validation.url('Avatar must be a valid URL')
            ]
        };
    }
    /**
     * Custom validation messages
     */
    messages() {
        return {
            'name.min': 'The name must be at least 2 characters.',
            'name.max': 'The name may not be greater than 255 characters.',
            'email.email': 'The email must be a valid email address.',
            'email.max': 'The email may not be greater than 255 characters.',
            'password.min': 'The password must be at least 8 characters.',
            'password.confirmed': 'The password confirmation does not match.',
            'password_confirmation.required': 'The password confirmation field is required when password is provided.',
            'avatar.url': 'The avatar must be a valid URL.'
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
            password_confirmation: 'Password Confirmation',
            avatar: 'Avatar'
        };
    }
}
exports.UpdateUserRequest = UpdateUserRequest;
//# sourceMappingURL=UpdateUserRequest.js.map