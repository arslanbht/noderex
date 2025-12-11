# Laravel-Style Validation Example

The Request validation system now works exactly like Laravel's FormRequest validation.

## Usage Example

### 1. Create a Request Class

```typescript
import { Request, Validation } from 'noderex';

export class CreateUserRequest extends Request {
    /**
     * Define validation rules
     */
    public rules(): Record<string, any> {
        return {
            name: [
                Validation.required('Name is required'),
                Validation.min(2, 'Name must be at least 2 characters'),
                Validation.max(255, 'Name may not be greater than 255 characters')
            ],
            email: [
                Validation.required('Email is required'),
                Validation.email('Email must be a valid email address'),
                Validation.unique('users', 'email', 'This email is already taken')
            ],
            password: [
                Validation.required('Password is required'),
                Validation.min(8, 'Password must be at least 8 characters'),
                Validation.confirmed('Password confirmation does not match')
            ],
            age: [
                Validation.required('Age is required'),
                Validation.numeric('Age must be a number'),
                Validation.minValue(18, 'You must be at least 18 years old'),
                Validation.maxValue(120, 'Age must be realistic')
            ],
            website: [
                Validation.url('Website must be a valid URL')
            ],
            role: [
                Validation.required('Role is required'),
                Validation.in(['admin', 'user', 'moderator'], 'Invalid role selected')
            ]
        };
    }

    /**
     * Custom validation messages (optional)
     */
    public messages(): Record<string, string> {
        return {
            'email.required': 'Please provide your email address',
            'email.email': 'Please provide a valid email address',
            'password.min': 'Password must be at least 8 characters long'
        };
    }

    /**
     * Custom attribute names (optional)
     */
    public attributes(): Record<string, string> {
        return {
            email: 'email address',
            password: 'password'
        };
    }
}
```

### 2. Use in Controller

```typescript
import { Controller } from './Controller';
import { validateRequest } from './Http/Requests/Request';
import { CreateUserRequest } from './Http/Requests/CreateUserRequest';
import { User } from '../Models/User';

export class UserController extends Controller {
    /**
     * Store a new user
     * The validateRequest middleware will:
     * 1. Validate the request data
     * 2. Replace req.body with only validated fields
     * 3. Throw ValidationException if validation fails
     */
    public async store(): Promise<void> {
        // req.body now contains ONLY validated fields (name, email, password, age, website, role)
        // All other fields are filtered out, just like Laravel's validated() method
        
        const user = new User();
        user.fill(this.all()); // This will only have validated fields
        await user.save();
        
        this.created(user);
    }
}
```

### 3. Register Route with Validation

```typescript
import { Router } from 'noderex';
import { validateRequest } from './app/Http/Requests/Request';
import { CreateUserRequest } from './app/Http/Requests/CreateUserRequest';
import { UserController } from './app/Http/Controllers/UserController';

const router = new Router(app);

// Apply validation middleware
router.post('/users', validateRequest(CreateUserRequest), 'UserController@store');
```

### 4. Access Validated Data

After validation, `req.body` contains only the fields that have validation rules:

```typescript
// Before validation: req.body = { name: 'John', email: 'john@example.com', password: 'secret', extraField: 'ignored' }
// After validation: req.body = { name: 'John', email: 'john@example.com', password: 'secret' }
// extraField is filtered out because it doesn't have validation rules
```

You can also access validated data via:
- `req.body` - Contains only validated fields
- `req.validated` - Same as req.body (Laravel-style)
- `req.request` - The Request instance (for advanced usage)

## Available Validation Rules

All validation rules return rule objects that can be used in the `rules()` method:

```typescript
Validation.required(message?)                    // Field is required
Validation.email(message?)                       // Must be valid email
Validation.min(length, message?)                  // Minimum string length
Validation.max(length, message?)                  // Maximum string length
Validation.minValue(value, message?)              // Minimum numeric value
Validation.maxValue(value, message?)              // Maximum numeric value
Validation.numeric(message?)                     // Must be a number
Validation.alpha(message?)                       // Only letters
Validation.alphaNumeric(message?)                // Letters and numbers only
Validation.url(message?)                          // Valid URL
Validation.uuid(message?)                         // Valid UUID
Validation.date(message?)                         // Valid date
Validation.boolean(message?)                      // Must be true/false
Validation.array(message?)                        // Must be an array
Validation.object(message?)                       // Must be an object
Validation.confirmed(message?)                    // Must match field_confirmation
Validation.different(field, message?)            // Must be different from another field
Validation.same(field, message?)                 // Must match another field
Validation.unique(table, column, message?)        // Must be unique in database
Validation.exists(table, column, message?)        // Must exist in database
Validation.in(values[], message?)                 // Must be in array of values
Validation.notIn(values[], message?)             // Must not be in array
Validation.regex(pattern, message?)              // Must match regex pattern
```

## Validation Response

When validation fails, the middleware automatically returns a 422 response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": [
      "Email must be a valid email address"
    ],
    "password": [
      "Password must be at least 8 characters"
    ]
  }
}
```

## Key Features

1. **Laravel-Style Rules**: Define rules using the `rules()` method with Validation helper
2. **Validated Data Only**: `validate()` returns only fields that have validation rules
3. **Automatic Filtering**: Fields without rules are automatically filtered out
4. **Custom Messages**: Override default messages per field/rule
5. **Custom Attributes**: Use friendly names in error messages
6. **Array of Rules**: Each field can have multiple rules
7. **Type-Safe**: Full TypeScript support

## Differences from Previous Implementation

- ✅ Uses `rules()` method (not decorators)
- ✅ `validate()` returns validated data (like Laravel's `validated()`)
- ✅ Only fields with rules are returned
- ✅ Works with Validation helper functions
- ✅ Supports custom messages and attributes
- ✅ Automatic error formatting
