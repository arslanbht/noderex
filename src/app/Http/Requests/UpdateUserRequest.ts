import { Request } from './Request';
import { Validation } from './Request';

/**
 * Update User Request
 * Validates user update data
 */
export class UpdateUserRequest extends Request {
  public name?: string;
  public email?: string;
  public password?: string;
  public password_confirmation?: string;
  public avatar?: string;

  /**
   * Get validation rules
   */
  public rules(): Record<string, any> {
    return {
      name: [
        Validation.min(2, 'Name must be at least 2 characters'),
        Validation.max(255, 'Name must not exceed 255 characters')
      ],
      email: [
        Validation.email('Email must be a valid email address'),
        Validation.max(255, 'Email must not exceed 255 characters')
      ],
      password: [
        Validation.min(8, 'Password must be at least 8 characters'),
        Validation.confirmed('Password confirmation does not match')
      ],
      password_confirmation: [
        Validation.required('Password confirmation is required when password is provided')
      ],
      avatar: [
        Validation.url('Avatar must be a valid URL')
      ]
    };
  }

  /**
   * Custom validation messages
   */
  public messages(): Record<string, string> {
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
  public attributes(): Record<string, string> {
    return {
      name: 'Name',
      email: 'Email',
      password: 'Password',
      password_confirmation: 'Password Confirmation',
      avatar: 'Avatar'
    };
  }
}
