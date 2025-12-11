# Laravel-Style Validation Implementation

## Summary

The Request validation system has been completely rewritten to work exactly like Laravel's FormRequest validation system.

## Key Changes

### 1. Custom Validation Engine
- **Removed**: Dependency on `class-validator` decorators
- **Added**: Custom validation engine that processes rules from `rules()` method
- **Result**: Works exactly like Laravel's validation system

### 2. Rules-Based Validation
- Rules are defined in `rules()` method using the `Validation` helper
- Each field can have multiple rules (array of rule objects)
- Rules are processed sequentially, collecting all errors

### 3. Validated Data Return
- `validate()` method now returns `Record<string, any>` (validated data)
- Only fields that have validation rules are returned
- Fields without rules are automatically filtered out
- This matches Laravel's `$request->validated()` behavior

### 4. Request Class Updates
- Added `setData()` method to set request data
- Added `all()` method to get all request data
- Added `get()` method to get specific field value
- Added `validated()` method to get only validated fields
- `validate()` now returns validated data instead of boolean

### 5. Middleware Updates
- `validateRequest()` middleware now:
  - Creates Request instance
  - Sets data from req.body, req.query, and req.params
  - Calls `validate()` which returns validated data
  - Replaces `req.body` with validated data only
  - Attaches `req.validated` and `req.request` for advanced usage

## Implementation Details

### Validation Rule Processing

Each rule object has a structure like:
```typescript
{ ruleType: ruleValue, message?: string }
```

For example:
- `{ required: true, message: 'Field is required' }`
- `{ email: true, message: 'Must be valid email' }`
- `{ minLength: 8, message: 'Must be at least 8 characters' }`

### Supported Validation Rules

All rules from the `Validation` helper are supported:
- `required` - Field must be present and not empty
- `email` - Must be valid email format
- `min` / `minLength` - Minimum string length
- `max` / `maxLength` - Maximum string length
- `minValue` - Minimum numeric value
- `maxValue` - Maximum numeric value
- `numeric` - Must be a number
- `alpha` - Only letters
- `alphaNumeric` - Letters and numbers
- `url` - Valid URL
- `uuid` - Valid UUID format
- `date` - Valid date
- `boolean` - Must be true/false
- `array` - Must be an array
- `object` - Must be an object
- `confirmed` - Must match `field_confirmation`
- `different` - Must be different from another field
- `same` - Must match another field
- `in` - Must be in array of values
- `notIn` - Must not be in array
- `regex` - Must match regex pattern
- `unique` - Must be unique in database (placeholder)
- `exists` - Must exist in database (placeholder)

### Error Messages

1. **Custom Messages**: Use `messages()` method to override default messages
   - Format: `'field.rule': 'Custom message'`
   - Example: `'email.required': 'Please provide your email'`

2. **Rule Messages**: Each rule can have its own message
   - Example: `Validation.required('Custom required message')`

3. **Attribute Names**: Use `attributes()` method for friendly field names
   - Example: `{ email: 'email address' }` → "The email address field is required"

4. **Default Messages**: If no custom message, uses default format
   - Format: `"The {attribute} {rule message}"`

### Data Flow

```
1. Request comes in → req.body = { name: 'John', email: 'invalid', extra: 'data' }
2. validateRequest middleware creates Request instance
3. Request.setData({ ...req.body, ...req.query, ...req.params })
4. Request.validate() is called
5. Rules are processed, errors collected
6. If errors: ValidationException thrown → 422 response
7. If valid: validated() returns { name: 'John', email: 'invalid' } (only fields with rules)
8. req.body = validated data (extra fields filtered out)
9. Controller receives only validated fields
```

## Usage Example

```typescript
// Request Class
export class CreateUserRequest extends Request {
    public rules(): Record<string, any> {
        return {
            name: [
                Validation.required('Name is required'),
                Validation.min(2, 'Name must be at least 2 characters')
            ],
            email: [
                Validation.required(),
                Validation.email('Invalid email')
            ]
        };
    }
}

// Controller
export class UserController extends Controller {
    public async store(): Promise<void> {
        // req.body now contains ONLY { name: '...', email: '...' }
        // Other fields are filtered out
        const user = new User();
        user.fill(this.all());
        await user.save();
        this.created(user);
    }
}

// Route
router.post('/users', validateRequest(CreateUserRequest), 'UserController@store');
```

## Benefits

1. ✅ **Laravel-Compatible**: Works exactly like Laravel's FormRequest
2. ✅ **Type-Safe**: Full TypeScript support
3. ✅ **Automatic Filtering**: Only validated fields are returned
4. ✅ **Flexible Messages**: Custom messages per field/rule
5. ✅ **Clean API**: Simple, intuitive interface
6. ✅ **No Decorators**: Uses rules() method instead of decorators

## Migration Notes

If you have existing Request classes using the old system:

1. Remove any `class-validator` decorators
2. Move validation logic to `rules()` method
3. Use `Validation` helper functions
4. Update code that calls `validate()` to use the returned data
5. Remove any code that accessed properties directly (use `validated()` instead)

## Testing

To test the validation:

```typescript
const request = new CreateUserRequest();
request.setData({ name: '', email: 'invalid' });
try {
    const validated = await request.validate();
    // Should throw ValidationException
} catch (error) {
    // error.errors contains validation errors
}
```
