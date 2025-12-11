# NodeRex Best Practices

Guidelines and best practices for building applications with NodeRex.

## Table of Contents

- [Project Structure](#project-structure)
- [Models](#models)
- [Controllers](#controllers)
- [Validation](#validation)
- [Error Handling](#error-handling)
- [Security](#security)
- [Performance](#performance)
- [Testing](#testing)

## Project Structure

Organize your project following Laravel conventions:

```
src/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── UserController.ts
│   │   │   └── PostController.ts
│   │   ├── Requests/
│   │   │   ├── CreateUserRequest.ts
│   │   │   └── UpdateUserRequest.ts
│   │   └── Resources/
│   │       ├── UserResource.ts
│   │       └── PostResource.ts
│   ├── Models/
│   │   ├── User.ts
│   │   └── Post.ts
│   └── Middleware/
│       └── AuthMiddleware.ts
├── config/
│   ├── app.ts
│   └── database.ts
├── database/
│   ├── migrations/
│   └── seeders/
└── routes/
    └── web.ts
```

## Models

### 1. Use TypeORM Decorators Properly

```typescript
import { Entity, Column, Index, PrimaryGeneratedColumn } from 'typeorm';
import { Model } from 'noderex';

@Entity('users')
@Index(['email'], { unique: true })
export class User extends Model {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;
}
```

### 2. Hide Sensitive Data

```typescript
export class User extends Model {
  @Column()
  password!: string;

  @Column()
  api_token!: string;

  public toJSON(): Record<string, any> {
    return this.hidden(['password', 'api_token']);
  }
}
```

### 3. Use Relationships

```typescript
export class User extends Model {
  public posts() {
    return this.hasMany(Post, 'user_id');
  }

  public profile() {
    return this.hasOne(Profile, 'user_id');
  }
}
```

### 4. Use Query Scopes

```typescript
export class Post extends Model {
  public static scopePublished(query: any) {
    return query.where('published = :published', { published: true });
  }

  public static scopeRecent(query: any, days: number = 7) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return query.where('created_at >= :date', { date });
  }
}
```

## Controllers

### 1. Keep Controllers Thin

Controllers should only handle HTTP concerns. Move business logic to services or models.

```typescript
// ❌ Bad - Business logic in controller
public async store(): Promise<void> {
  const email = this.input('email');
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return this.error('Email already exists', 409);
  }
  const hashedPassword = await bcrypt.hash(this.input('password'), 10);
  const user = new User();
  user.fill({ ...this.all(), password: hashedPassword });
  await user.save();
  this.created(user);
}

// ✅ Good - Business logic in service/model
public async store(): Promise<void> {
  const user = await UserService.create(this.all());
  this.created(UserResource.make(user).toArray());
}
```

### 2. Use Resources for Responses

Always use Resources to transform data before sending responses.

```typescript
public async index(): Promise<void> {
  const users = await User.find();
  const data = UserResource.transformCollection(users);
  this.success(data);
}
```

### 3. Handle Errors Properly

```typescript
public async show(): Promise<void> {
  const id = parseInt(this.input('id'));
  
  if (!id || isNaN(id)) {
    throw new BadRequestError('Invalid user ID');
  }

  const user = await User.findOne({ where: { id } });
  
  if (!user) {
    throw new NotFoundError('User not found');
  }

  this.success(UserResource.make(user).toArray());
}
```

## Validation

### 1. Use Request Classes

Always use Request classes for validation, never validate in controllers.

```typescript
// ❌ Bad - Validation in controller
public async store(): Promise<void> {
  const email = this.input('email');
  if (!email || !email.includes('@')) {
    return this.error('Invalid email', 422);
  }
  // ...
}

// ✅ Good - Validation in Request class
router.post('/users', validateRequest(CreateUserRequest), 'UserController@store');
```

### 2. Provide Clear Error Messages

```typescript
public rules(): Record<string, any> {
  return {
    email: [
      Validation.required('Email is required'),
      Validation.email('Please provide a valid email address'),
    ],
    password: [
      Validation.required('Password is required'),
      Validation.min(8, 'Password must be at least 8 characters long'),
    ],
  };
}
```

### 3. Use Custom Messages

```typescript
public messages(): Record<string, string> {
  return {
    'email.required': 'Please provide your email address',
    'email.email': 'Please provide a valid email address',
    'password.min': 'Password must be at least 8 characters long',
  };
}
```

## Error Handling

### 1. Use Custom Error Classes

```typescript
import {
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
} from 'noderex';

// Throw appropriate errors
if (!user) {
  throw new NotFoundError('User not found');
}

if (!isAuthorized) {
  throw new UnauthorizedError('Authentication required');
}
```

### 2. Don't Catch Errors Unnecessarily

Let the error handler middleware handle errors.

```typescript
// ❌ Bad - Catching and re-throwing
public async show(): Promise<void> {
  try {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundError('User not found');
    }
  } catch (error) {
    throw error;
  }
}

// ✅ Good - Let errors bubble up
public async show(): Promise<void> {
  const user = await User.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundError('User not found');
  }
}
```

## Security

### 1. Always Validate Input

Never trust user input. Always validate using Request classes.

### 2. Hide Sensitive Data

Use `hidden()` method or Resources to hide sensitive data.

```typescript
public toJSON(): Record<string, any> {
  return this.hidden(['password', 'api_token', 'secret_key']);
}
```

### 3. Use Parameterized Queries

Never use string concatenation for SQL queries. Use TypeORM's query builder or parameterized queries.

```typescript
// ❌ Bad - SQL injection risk
await queryRunner.query(`SELECT * FROM users WHERE id = ${id}`);

// ✅ Good - Parameterized query
await queryRunner.query('SELECT * FROM users WHERE id = ?', [id]);
```

### 4. Hash Passwords

Always hash passwords before storing.

```typescript
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash(password, 12);
```

## Performance

### 1. Use Eager Loading

Load relationships efficiently.

```typescript
// ❌ Bad - N+1 query problem
const users = await User.find();
for (const user of users) {
  const posts = await user.posts().get(); // N queries
}

// ✅ Good - Eager loading
const users = await User.find({ relations: ['posts'] });
```

### 2. Use Query Scopes

Reuse query logic with scopes.

```typescript
// ✅ Good - Reusable scope
const publishedPosts = await Post.scope('published').find();
```

### 3. Limit Results

Always limit results for list endpoints.

```typescript
public async index(): Promise<void> {
  const page = parseInt(this.input('page', '1'));
  const limit = parseInt(this.input('limit', '10'));
  
  const posts = await Post.scope('published')
    .skip((page - 1) * limit)
    .take(limit)
    .getMany();
  
  this.success(posts);
}
```

## Testing

### 1. Write Unit Tests

Test individual components in isolation.

```typescript
describe('UserController', () => {
  it('should return user data', async () => {
    const controller = new UserController();
    // Test logic
  });
});
```

### 2. Write Integration Tests

Test components working together.

```typescript
describe('User API', () => {
  it('should create a user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'John', email: 'john@example.com' });
    
    expect(response.status).toBe(201);
  });
});
```

### 3. Test Error Cases

Don't just test happy paths.

```typescript
it('should return 404 for non-existent user', async () => {
  const response = await request(app)
    .get('/api/users/999');
  
  expect(response.status).toBe(404);
});
```

## Additional Tips

1. **Use TypeScript Strict Mode**: Enable strict mode for better type safety
2. **Use Environment Variables**: Never hardcode sensitive values
3. **Log Important Events**: Use Logger for important operations
4. **Document Your Code**: Add JSDoc comments for complex logic
5. **Follow RESTful Conventions**: Use standard HTTP methods and status codes
6. **Version Your API**: Use route groups for API versioning
7. **Use Middleware**: Extract common logic into middleware
8. **Keep Functions Small**: Functions should do one thing well
9. **Use Meaningful Names**: Code should be self-documenting
10. **Review Code Regularly**: Regular code reviews improve quality
