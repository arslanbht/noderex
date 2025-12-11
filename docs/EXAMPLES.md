# NodeRex Examples

Practical examples for common use cases.

## Table of Contents

- [Creating a Model](#creating-a-model)
- [Creating a Controller](#creating-a-controller)
- [Creating a Request](#creating-a-request)
- [Creating a Resource](#creating-a-resource)
- [Setting Up Routes](#setting-up-routes)
- [Working with Relationships](#working-with-relationships)
- [Using Query Scopes](#using-query-scopes)
- [Database Migrations](#database-migrations)
- [Database Seeders](#database-seeders)
- [Error Handling](#error-handling)
- [Logging](#logging)

## Creating a Model

```typescript
import { Entity, Column, Index } from 'typeorm';
import { Model } from 'noderex';

@Entity('users')
@Index(['email'], { unique: true })
export class User extends Model {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  // Relationships
  public posts() {
    return this.hasMany(Post, 'user_id');
  }

  public profile() {
    return this.hasOne(Profile, 'user_id');
  }

  public roles() {
    return this.belongsToMany(Role, 'user_roles', 'user_id', 'role_id');
  }

  // Scopes
  public static scopeActive(query: any) {
    return query.where('active = :active', { active: true });
  }

  // Hide sensitive data
  public toJSON(): Record<string, any> {
    return this.hidden(['password']);
  }
}
```

## Creating a Controller

```typescript
import { Controller } from 'noderex';
import { User } from '../Models/User';
import { UserResource } from '../Resources/UserResource';
import { CreateUserRequest } from '../Requests/CreateUserRequest';
import { NotFoundError } from 'noderex';

export class UserController extends Controller {
  /**
   * Get all users
   */
  public async index(): Promise<void> {
    const users = await User.find();
    const data = UserResource.transformCollection(users);
    this.success(data);
  }

  /**
   * Get a single user
   */
  public async show(): Promise<void> {
    const id = parseInt(this.input('id'));
    const user = await User.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const data = UserResource.make(user).toArray();
    this.success(data);
  }

  /**
   * Create a new user
   */
  public async store(): Promise<void> {
    // req.body contains validated data from CreateUserRequest
    const user = new User();
    user.fill(this.all());
    await user.save();

    const data = UserResource.make(user).toArray();
    this.created(data, 'User created successfully');
  }

  /**
   * Update a user
   */
  public async update(): Promise<void> {
    const id = parseInt(this.input('id'));
    const user = await User.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.fill(this.all());
    await user.save();

    const data = UserResource.make(user).toArray();
    this.success(data, 'User updated successfully');
  }

  /**
   * Delete a user
   */
  public async destroy(): Promise<void> {
    const id = parseInt(this.input('id'));
    const user = await User.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await user.remove();
    this.noContent();
  }
}
```

## Creating a Request

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
        Validation.email('Email must be valid'),
        Validation.unique('users', 'email', 'This email is already taken'),
      ],
      password: [
        Validation.required('Password is required'),
        Validation.min(8, 'Password must be at least 8 characters'),
        Validation.confirmed('Password confirmation does not match'),
      ],
      age: [
        Validation.nullable(),
        Validation.integer('Age must be an integer'),
        Validation.between(18, 120, 'Age must be between 18 and 120'),
      ],
      website: [
        Validation.nullable(),
        Validation.url('Website must be a valid URL'),
      ],
    };
  }

  public messages(): Record<string, string> {
    return {
      'email.required': 'Please provide your email address',
      'email.email': 'Please provide a valid email address',
      'password.min': 'Password must be at least 8 characters long',
    };
  }

  public attributes(): Record<string, string> {
    return {
      email: 'email address',
      password: 'password',
    };
  }
}
```

## Creating a Resource

```typescript
import { Resource } from 'noderex';

export class UserResource extends Resource {
  public transform(): Record<string, any> {
    return {
      id: this.resource.id,
      name: this.resource.name,
      email: this.resource.email,
      active: this.resource.active,
      created_at: this.resource.created_at,
      updated_at: this.resource.updated_at,
      // Conditionally include data
      profile: this.when(this.resource.profile, this.resource.profile),
      posts_count: this.whenCallback(
        this.resource.posts,
        () => this.resource.posts.length,
        0
      ),
    };
  }
}

// Usage
const user = await User.findOne({ where: { id: 1 } });
const resource = UserResource.make(user);
const data = resource.toArray();

// Collection
const users = await User.find();
const data = UserResource.transformCollection(users);
```

## Setting Up Routes

```typescript
import { NodeRexApplication } from 'noderex';
import { Router } from 'noderex';
import { validateRequest } from 'noderex';
import { CreateUserRequest } from './app/Http/Requests/CreateUserRequest';
import { UpdateUserRequest } from './app/Http/Requests/UpdateUserRequest';

const app = new NodeRexApplication();
const router = app.getRouter();

// Register middleware
router.middleware('auth', async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  // Verify token and attach user to request
  next();
});

// Basic routes
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// Route groups
router.group('/api/v1', (router) => {
  // API resource routes
  router.apiResource('users', 'UserController');

  // Custom routes with validation
  router.post('/users', validateRequest(CreateUserRequest), 'UserController@store');
  router.put('/users/:id', validateRequest(UpdateUserRequest), 'UserController@update');

  // Routes with middleware
  router.group('/admin', (router) => {
    router.get('/users', 'AdminController@index');
  }, ['auth']);
});

// Register all routes
router.registerRoutes();

// Start application
app.start().catch(console.error);
```

## Working with Relationships

```typescript
// HasMany - Get user's posts
const user = await User.findOne({ where: { id: 1 } });
const posts = await user.posts().get();
const postCount = await user.posts().count();

// Create a post for user
const newPost = await user.posts().create({
  title: 'New Post',
  content: 'Post content',
});

// BelongsTo - Get post's user
const post = await Post.findOne({ where: { id: 1 } });
const user = await post.user().get();

// HasOne - Get user's profile
const user = await User.findOne({ where: { id: 1 } });
const profile = await user.profile().get();

// Create or update profile
await user.profile().updateOrCreate(
  { user_id: user.id },
  { bio: 'Updated bio', avatar: 'avatar.jpg' }
);

// BelongsToMany - Get user's roles
const user = await User.findOne({ where: { id: 1 } });
const roles = await user.roles().get();

// Attach roles
const adminRole = await Role.findOne({ where: { name: 'admin' } });
await user.roles().attach([adminRole]);

// Sync roles (detach all and attach new ones)
await user.roles().sync([1, 2, 3]);

// Toggle roles
await user.roles().toggle([1, 2]);
```

## Using Query Scopes

```typescript
// Global scopes (automatically applied)
User.addGlobalScope('active', (query) => {
  return query.where('active = :active', { active: true });
});

User.addGlobalScope('notDeleted', (query) => {
  return query.where('deleted_at IS NULL');
});

// All queries automatically apply global scopes
const users = await User.find(); // Only active, non-deleted users

// Query without global scopes
const allUsers = await User.withoutGlobalScopes().find();

// Query without specific global scope
const allUsersIncludingInactive = await User.withoutGlobalScopes('active').find();

// Local scopes
export class Post extends Model {
  public static scopePublished(query: any) {
    return query.where('published = :published', { published: true });
  }

  public static scopePopular(query: any, minViews: number = 100) {
    return query.where('views >= :minViews', { minViews });
  }

  public static scopeRecent(query: any, days: number = 7) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return query.where('created_at >= :date', { date });
  }
}

// Use scopes
const publishedPosts = await Post.scope('published').find();
const popularPosts = await Post.scope('popular', 1000).find();
const recentPopularPosts = await Post.scope('popular', 500)
  .scope('recent', 30)
  .find();
```

## Database Migrations

```typescript
import { Migration, Schema, Index } from 'noderex';
import { QueryRunner, Table } from 'typeorm';

export class CreateUsersTable extends Migration {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.createTable(queryRunner, new Table({
      name: 'users',
      columns: [
        Schema.id(),
        Schema.string('name', 255, false),
        Schema.string('email', 255, false),
        Schema.string('password', 255, false),
        Schema.boolean('active', true),
        Schema.integer('age', true),
        ...Schema.timestamps(),
      ],
      indices: [
        Index.unique('users_email_unique', ['email']),
        Index.index('users_active_index', ['active']),
      ],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.dropTable(queryRunner, 'users');
  }
}
```

## Database Seeders

```typescript
import { Seeder } from 'noderex';
import { User } from '../app/Models/User';
import { Role } from '../app/Models/Role';

export class UserSeeder extends Seeder {
  public async run(): Promise<void> {
    // Create users using entity class
    await this.create(User, [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
        active: true,
      },
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'hashed_password',
        active: true,
      },
    ]);

    // Create roles using raw SQL
    await this.createRaw('roles', [
      { name: 'admin', display_name: 'Administrator' },
      { name: 'user', display_name: 'User' },
    ]);

    // Execute custom queries
    const adminRole = await this.query(
      'SELECT * FROM roles WHERE name = ?',
      ['admin']
    );
  }
}
```

## Error Handling

```typescript
import {
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} from 'noderex';

export class UserController extends Controller {
  public async show(): Promise<void> {
    const id = parseInt(this.input('id'));

    if (!id || isNaN(id)) {
      throw new BadRequestError('Invalid user ID');
    }

    const user = await User.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check authorization
    const currentUser = (this.getRequest() as any).user;
    if (user.id !== currentUser.id && !currentUser.isAdmin) {
      throw new ForbiddenError('You cannot access this resource');
    }

    this.success(UserResource.make(user).toArray());
  }

  public async store(): Promise<void> {
    const email = this.input('email');
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const user = new User();
    user.fill(this.all());
    await user.save();

    this.created(UserResource.make(user).toArray());
  }
}
```

## Logging

```typescript
import { Logger, LogLevel } from 'noderex';

// Set log level
Logger.setLevel(LogLevel.DEBUG);

// Debug logging
Logger.debug('Processing request', { userId: 123, action: 'create' });

// Info logging
Logger.info('User created successfully', { userId: 123, email: 'user@example.com' });

// Warning logging
Logger.warn('Rate limit approaching', { ip: '192.168.1.1', requests: 95 });

// Error logging
try {
  // Some operation
  await riskyOperation();
} catch (error) {
  Logger.error('Operation failed', error, {
    userId: 123,
    operation: 'riskyOperation',
    context: 'additional info',
  });
}

// Request logging (automatic in middleware)
Logger.request(req, res, 150); // 150ms response time
```

## Complete Example: Blog API

```typescript
// Models
@Entity('users')
export class User extends Model {
  @Column()
  name!: string;

  @Column()
  email!: string;

  public posts() {
    return this.hasMany(Post, 'user_id');
  }
}

@Entity('posts')
export class Post extends Model {
  @Column()
  title!: string;

  @Column('text')
  content!: string;

  @Column()
  user_id!: number;

  @Column()
  published!: boolean;

  public user() {
    return this.belongsTo(User, 'user_id');
  }

  public static scopePublished(query: any) {
    return query.where('published = :published', { published: true });
  }
}

// Controller
export class PostController extends Controller {
  public async index(): Promise<void> {
    const posts = await Post.scope('published').find();
    this.success(PostResource.transformCollection(posts));
  }

  public async store(): Promise<void> {
    const user = (this.getRequest() as any).user;
    const post = new Post();
    post.fill({ ...this.all(), user_id: user.id });
    await post.save();
    this.created(PostResource.make(post).toArray());
  }
}

// Routes
router.group('/api', (router) => {
  router.apiResource('posts', 'PostController');
}, ['auth']);
```
