# Migration Guide

Guide for migrating from other frameworks or upgrading NodeRex.

## Migrating from Laravel

NodeRex follows Laravel conventions, making migration straightforward.

### Controllers

**Laravel:**
```php
class UserController extends Controller
{
    public function index()
    {
        return User::all();
    }
}
```

**NodeRex:**
```typescript
export class UserController extends Controller {
    public async index(): Promise<void> {
        const users = await User.find();
        this.success(UserResource.transformCollection(users));
    }
}
```

### Models

**Laravel:**
```php
class User extends Model
{
    protected $hidden = ['password'];
    
    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}
```

**NodeRex:**
```typescript
export class User extends Model {
    public toJSON(): Record<string, any> {
        return this.hidden(['password']);
    }

    public posts() {
        return this.hasMany(Post, 'user_id');
    }
}
```

### Validation

**Laravel:**
```php
class CreateUserRequest extends FormRequest
{
    public function rules()
    {
        return [
            'name' => 'required|min:2',
            'email' => 'required|email|unique:users',
        ];
    }
}
```

**NodeRex:**
```typescript
export class CreateUserRequest extends Request {
    public rules(): Record<string, any> {
        return {
            name: [
                Validation.required(),
                Validation.min(2),
            ],
            email: [
                Validation.required(),
                Validation.email(),
                Validation.unique('users', 'email'),
            ],
        };
    }
}
```

### Routes

**Laravel:**
```php
Route::apiResource('users', UserController::class);
Route::post('/users', [UserController::class, 'store'])
    ->middleware('auth');
```

**NodeRex:**
```typescript
router.apiResource('users', 'UserController');
router.post('/users', validateRequest(CreateUserRequest), 'UserController@store');
```

## Migrating from Express

### Basic Express App

**Express:**
```typescript
import express from 'express';
const app = express();

app.get('/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});
```

**NodeRex:**
```typescript
import { NodeRexApplication } from 'noderex';
const app = new NodeRexApplication();
const router = app.getRouter();

router.get('/users', 'UserController@index');
router.registerRoutes();
```

### Middleware

**Express:**
```typescript
app.use((req, res, next) => {
    // Middleware logic
    next();
});
```

**NodeRex:**
```typescript
router.middleware('auth', (req, res, next) => {
    // Middleware logic
    next();
});

router.get('/users', 'UserController@index', ['auth']);
```

### Error Handling

**Express:**
```typescript
app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
});
```

**NodeRex:**
```typescript
// Error handler is built-in
// Just throw errors:
throw new NotFoundError('User not found');
```

## Upgrading NodeRex

### From v1.0.0 to v1.0.8+

#### New Features

1. **Relationships**: Now available
```typescript
// Old way (if you had custom implementation)
const posts = await Post.find({ where: { user_id: user.id } });

// New way
const posts = await user.posts().get();
```

2. **Query Scopes**: Now available
```typescript
// Old way
const posts = await Post.find({ where: { published: true } });

// New way
const posts = await Post.scope('published').find();
```

3. **Enhanced Validation**: More rules available
```typescript
// Old way
Validation.required()
Validation.email()

// New way (same, but more rules available)
Validation.nullable()
Validation.sometimes()
Validation.requiredIf()
// ... 50+ rules total
```

4. **Better Error Handling**: Custom error classes
```typescript
// Old way
res.status(404).json({ error: 'Not found' });

// New way
throw new NotFoundError('User not found');
```

5. **Logger**: Structured logging
```typescript
// Old way
console.log('User created');

// New way
Logger.info('User created', { userId: 123 });
```

### Breaking Changes

None! All changes are backward compatible.

### Migration Steps

1. **Update Dependencies**
```bash
npm update noderex
```

2. **Update Imports** (if using new features)
```typescript
// Add new imports
import { Logger, NotFoundError, HasMany } from 'noderex';
```

3. **Update Error Handling** (optional)
```typescript
// Replace manual error responses with error classes
throw new NotFoundError('User not found');
```

4. **Add Relationships** (optional)
```typescript
// Replace manual queries with relationships
const posts = await user.posts().get();
```

5. **Add Query Scopes** (optional)
```typescript
// Replace repeated queries with scopes
const posts = await Post.scope('published').find();
```

## Migrating from TypeORM Direct Usage

### Models

**TypeORM:**
```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
}
```

**NodeRex:**
```typescript
import { Entity, Column } from 'typeorm';
import { Model } from 'noderex';

@Entity('users')
export class User extends Model {
    @Column()
    name!: string;
    // id, created_at, updated_at are inherited
}
```

### Queries

**TypeORM:**
```typescript
const repository = getRepository(User);
const users = await repository.find();
```

**NodeRex:**
```typescript
const users = await User.find();
// Or with scopes
const users = await User.scope('active').find();
```

### Relationships

**TypeORM:**
```typescript
@OneToMany(() => Post, post => post.user)
posts: Post[];
```

**NodeRex:**
```typescript
public posts() {
    return this.hasMany(Post, 'user_id');
}

// Usage
const posts = await user.posts().get();
```

## Common Migration Patterns

### Pattern 1: Manual Queries to Relationships

**Before:**
```typescript
const posts = await Post.find({ where: { user_id: user.id } });
```

**After:**
```typescript
const posts = await user.posts().get();
```

### Pattern 2: Repeated Queries to Scopes

**Before:**
```typescript
const publishedPosts = await Post.find({ where: { published: true } });
const recentPosts = await Post.find({ 
    where: { 
        published: true,
        created_at: MoreThan(sevenDaysAgo)
    }
});
```

**After:**
```typescript
const publishedPosts = await Post.scope('published').find();
const recentPosts = await Post.scope('published').scope('recent', 7).find();
```

### Pattern 3: Manual Validation to Request Classes

**Before:**
```typescript
public async store(): Promise<void> {
    const email = this.input('email');
    if (!email || !email.includes('@')) {
        return this.error('Invalid email', 422);
    }
    // ...
}
```

**After:**
```typescript
// In CreateUserRequest
public rules(): Record<string, any> {
    return {
        email: [Validation.required(), Validation.email()],
    };
}

// In Controller
public async store(): Promise<void> {
    // req.body is already validated
    // ...
}
```

### Pattern 4: Manual JSON Transformation to Resources

**Before:**
```typescript
public async index(): Promise<void> {
    const users = await User.find();
    const data = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
    }));
    this.success(data);
}
```

**After:**
```typescript
public async index(): Promise<void> {
    const users = await User.find();
    const data = UserResource.transformCollection(users);
    this.success(data);
}
```

## Tips for Smooth Migration

1. **Start Small**: Migrate one feature at a time
2. **Keep Old Code**: Don't delete old code until new code is tested
3. **Test Thoroughly**: Test each migrated feature
4. **Use TypeScript**: TypeScript helps catch migration issues
5. **Read Documentation**: Refer to API docs for new features
6. **Ask for Help**: Check examples and best practices guides

## Need Help?

- Check [API Documentation](./API.md)
- See [Examples](./EXAMPLES.md)
- Review [Best Practices](./BEST_PRACTICES.md)
- Open an issue on GitHub
