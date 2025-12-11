# Validation

## Introduction

NodeRex provides several different approaches to validate your application's incoming data. By default, NodeRex's base controller class uses the `validateRequest` middleware which provides convenient methods to validate incoming HTTP requests with a variety of powerful validation rules.

## Validation Quickstart

### Defining The Routes

To learn about NodeRex's powerful validation features, let's look at a complete example of validating a form and displaying the error messages back to the user.

First, let's assume we have the following routes defined in our `routes/web.ts` file:

```typescript
router.post('/users', validateRequest(CreateUserRequest), 'UserController@store');
```

### Creating The Request Class

Now we are ready to fill in the `store` method with our validation logic. To get started, let's use the `make:request` Artisan command to generate a form request class:

```bash
npm run artisan make:request CreateUserRequest
```

The generated class will be placed in the `src/app/Http/Requests` directory. Let's add a few validation rules to the `rules` method:

```typescript
import { Request, Validation } from 'noderex';

export class CreateUserRequest extends Request {
  public rules(): Record<string, any> {
    return {
      name: [
        Validation.required('Name is required'),
        Validation.min(2, 'Name must be at least 2 characters'),
        Validation.max(255, 'Name may not exceed 255 characters'),
      ],
      email: [
        Validation.required('Email is required'),
        Validation.email('Email must be a valid email address'),
        Validation.unique('users', 'email', 'This email is already taken'),
      ],
      password: [
        Validation.required('Password is required'),
        Validation.min(8, 'Password must be at least 8 characters'),
        Validation.confirmed('Password confirmation does not match'),
      ],
    };
  }
}
```

### Authorizing Form Requests

The form request class also contains an `authorize` method. Within this method, you may check if the authenticated user actually has authority to update the given resource. For example, you may determine if a user actually owns a blog comment they are attempting to update:

```typescript
public authorize(): boolean {
  const comment = Comment.findOne({ where: { id: this.input('id') } });
  return comment.user_id === this.getRequest().user.id;
}
```

If the `authorize` method returns `false`, a 403 Forbidden HTTP response will be automatically returned and your controller method will not execute.

### Customizing The Error Messages

You may customize the error messages used by the form request by overriding the `messages` method. This method should return an array of attribute / rule pairs and their corresponding error messages:

```typescript
public messages(): Record<string, string> {
  return {
    'name.required': 'A name is required',
    'email.required': 'An email address is required',
    'email.email': 'The email must be a valid email address',
    'password.min': 'The password must be at least 8 characters',
  };
}
```

### Customizing The Validation Attributes

Many of NodeRex's built-in validation rule error messages contain an `:attribute` placeholder. If you would like the `:attribute` placeholder of your validation message to be replaced with a custom attribute name, you may specify the custom names in the `attributes` method:

```typescript
public attributes(): Record<string, string> {
  return {
    email: 'email address',
    password: 'password',
  };
}
```

## Available Validation Rules

Below is a list of all available validation rules and their function signatures:

### Accepted

The field under validation must be `yes`, `on`, `1`, `true`, or `true`. This is useful for validating "Terms of Service" acceptance or similar fields.

```typescript
Validation.accepted('The terms must be accepted')
```

### Alpha

The field under validation must be entirely alphabetic characters.

```typescript
Validation.alpha('The field may only contain letters')
```

### Alpha Dash

The field under validation may have alpha-numeric characters, as well as dashes and underscores.

```typescript
Validation.alphaDash('The field may only contain letters, numbers, dashes and underscores')
```

### Alpha Numeric

The field under validation must be entirely alpha-numeric characters.

```typescript
Validation.alphaNumeric('The field must be alphanumeric')
```

### Array

The field under validation must be a JavaScript array.

```typescript
Validation.array('The field must be an array')
```

### Boolean

The field under validation must be able to be cast as a boolean. Accepted input are `true`, `false`, `1`, `0`, `"1"`, and `"0"`.

```typescript
Validation.boolean('The field must be true or false')
```

### Confirmed

The field under validation must have a matching field of `{field}_confirmation`. For example, if the field under validation is `password`, a matching `password_confirmation` field must be present in the input.

```typescript
Validation.confirmed('The password confirmation does not match')
```

### Date

The field under validation must be a valid, non-relative date according to the `Date` constructor.

```typescript
Validation.date('The field must be a valid date')
```

### Different

The field under validation must have a different value than `field`.

```typescript
Validation.different('other_field', 'The field and other field must be different')
```

### Email

The field under validation must be formatted as an e-mail address.

```typescript
Validation.email('The field must be a valid email address')
```

### In

The field under validation must be included in the given list of values.

```typescript
Validation.in(['red', 'green', 'blue'], 'The selected field is invalid')
```

### Integer

The field under validation must be an integer.

```typescript
Validation.integer('The field must be an integer')
```

### Max

The field under validation must be less than or equal to a maximum value. Strings, numerics, arrays, and files are evaluated in the same fashion as the `min` rule.

```typescript
Validation.max(255, 'The field may not be greater than 255 characters')
Validation.maxValue(100, 'The field may not be greater than 100')
```

### Min

The field under validation must have a minimum value. Strings, numerics, arrays, and files are evaluated in the same fashion as the `max` rule.

```typescript
Validation.min(2, 'The field must be at least 2 characters')
Validation.minValue(18, 'The field must be at least 18')
```

### Not In

The field under validation must not be included in the given list of values.

```typescript
Validation.notIn(['admin', 'superuser'], 'The selected field is invalid')
```

### Nullable

The field under validation may be `null`. This is particularly useful when you want to validate primitive such as strings and integers that can contain `null` values.

```typescript
Validation.nullable()
```

### Numeric

The field under validation must be numeric.

```typescript
Validation.numeric('The field must be a number')
```

### Required

The field under validation must be present in the input data and not empty. A field is considered "empty" if it is:
- `null`
- `undefined`
- An empty string
- An empty array

```typescript
Validation.required('The field is required')
```

### Required If

The field under validation must be present and not empty if the `anotherfield` field is equal to any `value`.

```typescript
Validation.requiredIf('status', 'pending', 'The field is required when status is pending')
```

### Required Unless

The field under validation must be present and not empty unless the `anotherfield` field is equal to any `value`.

```typescript
Validation.requiredUnless('status', 'draft', 'The field is required unless status is draft')
```

### Required With

The field under validation must be present and not empty if any of the other specified fields are present.

```typescript
Validation.requiredWith(['first_name', 'last_name'], 'The field is required when first name or last name is present')
```

### Required With All

The field under validation must be present and not empty only if all of the other specified fields are present.

```typescript
Validation.requiredWithAll(['first_name', 'last_name'], 'The field is required when first name and last name are present')
```

### Required Without

The field under validation must be present and not empty when any of the other specified fields are not present.

```typescript
Validation.requiredWithout(['first_name', 'last_name'], 'The field is required when first name or last name is not present')
```

### Required Without All

The field under validation must be present and not empty only when all of the other specified fields are not present.

```typescript
Validation.requiredWithoutAll(['first_name', 'last_name'], 'The field is required when neither first name nor last name are present')
```

### Same

The given field must match the field under validation.

```typescript
Validation.same('password', 'The field and password must match')
```

### Sometimes

In some situations, you may wish to run validation checks against a field **only** if that field is present in the input array. To quickly accomplish this, add the `sometimes` rule:

```typescript
Validation.sometimes()
```

### Size

The field under validation must have a size matching the given `value`. For string data, `value` corresponds to the number of characters. For numeric data, `value` corresponds to a given integer value. For an array, `size` corresponds to the count of the array.

```typescript
Validation.size(10, 'The field must be exactly 10 characters')
```

### URL

The field under validation must be a valid URL.

```typescript
Validation.url('The field must be a valid URL')
```

### UUID

The field under validation must be a valid UUID.

```typescript
Validation.uuid('The field must be a valid UUID')
```

## Conditionally Adding Rules

### Sometimes

In some situations, you may wish to run validation checks against a field **only** if that field is present in the input array. To quickly accomplish this, add the `sometimes` rule to your rules list:

```typescript
public rules(): Record<string, any> {
  return {
    email: [
      Validation.sometimes(),
      Validation.email(),
    ],
  };
}
```

In the example above, the `email` field will only be validated if it is present in the input array.

### Complex Conditional Validation

Sometimes you may wish to add validation rules based on more complex conditional logic. For example, you may wish to require a given field only if another field has a greater value than 100. Or, you may need two fields to have a given value only when another field is present. Adding these validation rules doesn't have to be a pain:

```typescript
public rules(): Record<string, any> {
  return {
    email: [
      Validation.requiredIf('account_type', 'premium', 'Email is required for premium accounts'),
      Validation.email(),
    ],
    credit_card: [
      Validation.requiredUnless('payment_method', 'cash', 'Credit card is required unless paying with cash'),
    ],
  };
}
```

## Working With Validated Input

After validating incoming request data, you may wish to retrieve the validated input. You can do this using the `validated` method:

```typescript
const validated = await request.validated();
```

The `validated` method will return only the data that was validated, filtering out any data that doesn't have validation rules.

## Next Steps

Now that you've learned the basics of validation, you may want to explore some additional features:

- **[Custom Validation Rules](#custom-validation-rules)** - Creating your own validation rules
- **[Form Request Validation](#form-request-validation)** - Advanced form request features
- **[API Resources](RESOURCES.md)** - Transforming validated data for API responses
