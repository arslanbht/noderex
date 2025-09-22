import { Request } from './Request';
import { Validation } from './Request';

/**
 * Create User Request
 * Validates user creation data
 */
export class CreateUserRequest extends Request {
  public name!: string;
  public email!: string;
  public password!: string;
  public password_confirmation?: string;

  /**
   * Get validation rules
   */
  public rules(): Record<string, any> {
    return {
      name: [
        Validation.required('Name is required'),
        Validation.min(2, 'Name must be at least 2 characters'),
        Validation.max(255, 'Name must not exceed 255 characters')
      ],
      email: [
        Validation.required('Email is required'),
        Validation.email('Email must be a valid email address'),
        Validation.max(255, 'Email must not exceed 255 characters'),
        Validation.unique('users', 'email', 'Email already exists')
      ],
      password: [
        Validation.required('Password is required'),
        Validation.min(8, 'Password must be at least 8 characters'),
        Validation.confirmed('Password confirmation does not match')
      ],
      password_confirmation: [
        Validation.required('Password confirmation is required')
      ]
    };
  }

  /**
   * Custom validation messages
   */
  public messages(): Record<string, string> {
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
  public attributes(): Record<string, string> {
    return {
      name: 'Name',
      email: 'Email',
      password: 'Password',
      password_confirmation: 'Password Confirmation'
    };
  }
}
