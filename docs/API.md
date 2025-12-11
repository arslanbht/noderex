# NodeRex API Documentation

Complete API reference for the NodeRex framework.

## Table of Contents

- [Models](#models)
- [Controllers](#controllers)
- [Requests](#requests)
- [Resources](#resources)
- [Router](#router)
- [Migrations](#migrations)
- [Seeders](#seeders)
- [Logger](#logger)
- [Error Handling](#error-handling)

## Models

### Base Model Class

The `Model` class extends TypeORM's `BaseEntity` and provides Laravel-style functionality.

#### Methods

##### `fill(attributes: Record<string, any>): this`

Fill the model with attributes.

```typescript
const user = new User();
user.fill({ name: 'John', email: 'john@example.com' });
await user.save();
```

##### `toJSON(): Record<string, any>`

Convert model to JSON object.

```typescript
const user = await User.findOne({ where: { id: 1 } });
const json = user.toJSON();
```

##### `only(attributes: string[]): Record<string, any>`

Get only specified attributes.

```typescript
const user = await User.findOne({ where: { id: 1 } });
const publicData = user.only(['id', 'name', 'email']);
```

##### `hidden(attributes: string[]): Record<string, any>`

Hide specified attributes from JSON.

```typescript
const user = await User.findOne({ where: { id: 1 } });
const safeData = user.hidden(['password', 'api_token']);
```

##### `hasMany<T>(related: new () => T, foreignKey?: string, localKey?: string): HasMany<T>`

Define a has-many relationship.

```typescript
public posts() {
  return this.hasMany(Post, 'user_id');
}
```

##### `belongsTo<T>(related: new () => T, foreignKey?: string, ownerKey?: string): BelongsTo<T>`

Define a belongs-to relationship.

```typescript
public user() {
  return this.belongsTo(User, 'user_id');
}
```

##### `hasOne<T>(related: new () => T, foreignKey?: string, localKey?: string): HasOne<T>`

Define a has-one relationship.

```typescript
public profile() {
  return this.hasOne(Profile, 'user_id');
}
```

##### `belongsToMany<T>(related: new () => T, pivotTable: string, foreignPivotKey?: string, relatedPivotKey?: string): BelongsToMany<T>`

Define a belongs-to-many relationship.

```typescript
public roles() {
  return this.belongsToMany(Role, 'user_roles', 'user_id', 'role_id');
}
```

#### Static Methods

##### `getRepository()`

Get TypeORM repository for the model.

```typescript
const repository = User.getRepository();
const users = await repository.find();
```

##### `addGlobalScope(name: string, scope: (query: any) => any): void`

Add a global scope.

```typescript
User.addGlobalScope('active', (query) => {
  return query.where('active = :active', { active: true });
});
```

##### `removeGlobalScope(name: string): void`

Remove a global scope.

```typescript
User.removeGlobalScope('active');
```

##### `scope(scopeName: string, ...args: any[]): any`

Apply a named scope.

```typescript
const activeUsers = await User.scope('active').getMany();
```

##### `withoutGlobalScopes(...scopeNames: string[]): any`

Get query builder without global scopes.

```typescript
const allUsers = await User.withoutGlobalScopes().getMany();
const usersWithoutActiveScope = await User.withoutGlobalScopes('active').getMany();
```

## Controllers

### Base Controller Class

The `Controller` class provides common functionality for all controllers.

#### Methods

##### `setContext(req: Request, res: Response, next: NextFunction): void`

Set the request context (called automatically by Router).

##### `all(): Record<string, any>`

Get all input from request (body, query, params merged).

```typescript
const allInput = this.all();
```

##### `input(key: string, defaultValue?: any): any`

Get input by key.

```typescript
const name = this.input('name');
const age = this.input('age', 0);
```

##### `only(keys: string[]): Record<string, any>`

Get only specified inputs.

```typescript
const data = this.only(['name', 'email']);
```

##### `except(keys: string[]): Record<string, any>`

Get all inputs except specified ones.

```typescript
const data = this.except(['password', 'api_token']);
```

##### `has(key: string): boolean`

Check if input exists.

```typescript
if (this.has('email')) {
  // Email is present
}
```

##### `filled(key: string): boolean`

Check if input exists and is not empty.

```typescript
if (this.filled('name')) {
  // Name has a value
}
```

##### `success(data: any, message?: string, status?: number): Response`

Send success response.

```typescript
this.success({ user }, 'User created successfully', 201);
```

##### `error(message?: string, status?: number, errors?: Record<string, string[]>): Response`

Send error response.

```typescript
this.error('Something went wrong', 500);
this.error('Validation failed', 422, { email: ['Invalid email'] });
```

##### `validationError(errors: Record<string, string[]>): Response`

Send validation error response.

```typescript
this.validationError({ email: ['Email is required'] });
```

##### `notFound(message?: string): Response`

Send 404 response.

```typescript
this.notFound('User not found');
```

##### `unauthorized(message?: string): Response`

Send 401 response.

```typescript
this.unauthorized('Authentication required');
```

##### `forbidden(message?: string): Response`

Send 403 response.

```typescript
this.forbidden('Access denied');
```

##### `created(data: any, message?: string): Response`

Send 201 response.

```typescript
this.created({ user }, 'User created successfully');
```

##### `noContent(): Response`

Send 204 response.

```typescript
this.noContent();
```

## Requests

### Base Request Class

The `Request` class provides Laravel-style validation.

#### Methods

##### `rules(): Record<string, any>`

Define validation rules (abstract method, must be implemented).

```typescript
public rules(): Record<string, any> {
  return {
    name: [Validation.required(), Validation.min(2)],
    email: [Validation.required(), Validation.email()],
  };
}
```

##### `messages(): Record<string, string>`

Custom validation messages (optional).

```typescript
public messages(): Record<string, string> {
  return {
    'email.required': 'Please provide your email address',
    'email.email': 'Please provide a valid email',
  };
}
```

##### `attributes(): Record<string, string>`

Custom attribute names (optional).

```typescript
public attributes(): Record<string, string> {
  return {
    email: 'email address',
    password: 'password',
  };
}
```

##### `validate(): Promise<Record<string, any>>`

Validate request and return validated data.

```typescript
const validatedData = await request.validate();
```

##### `validated(): Record<string, any>`

Get only validated fields.

```typescript
const validated = request.validated();
```

##### `all(): Record<string, any>`

Get all request data.

```typescript
const all = request.all();
```

##### `get(key: string, defaultValue?: any): any`

Get a specific field value.

```typescript
const email = request.get('email');
```

##### `setData(data: Record<string, any>): void`

Set request data.

```typescript
request.setData({ name: 'John', email: 'john@example.com' });
```

### Validation Rules

All validation rules are available via the `Validation` helper:

```typescript
import { Validation } from 'noderex';

// Basic rules
Validation.required(message?)
Validation.nullable()
Validation.sometimes()
Validation.email(message?)
Validation.min(length, message?)
Validation.max(length, message?)

// Numeric rules
Validation.numeric(message?)
Validation.integer(message?)
Validation.minValue(value, message?)
Validation.maxValue(value, message?)
Validation.between(min, max, message?)

// String rules
Validation.alpha(message?)
Validation.alphaNumeric(message?)
Validation.alphaDash(message?)
Validation.size(size, message?)
Validation.startsWith(prefix, message?)
Validation.endsWith(suffix, message?)
Validation.contains(value, message?)
Validation.regex(pattern, message?)

// Date rules
Validation.date(message?)
Validation.dateFormat(format, message?)
Validation.before(date, message?)
Validation.after(date, message?)
Validation.beforeOrEqual(date, message?)
Validation.afterOrEqual(date, message?)

// Conditional rules
Validation.requiredIf(field, value, message?)
Validation.requiredUnless(field, value, message?)
Validation.requiredWith(fields[], message?)
Validation.requiredWithAll(fields[], message?)
Validation.requiredWithout(fields[], message?)
Validation.requiredWithoutAll(fields[], message?)

// Other rules
Validation.confirmed(message?)
Validation.different(field, message?)
Validation.same(field, message?)
Validation.in(values[], message?)
Validation.notIn(values[], message?)
Validation.url(message?)
Validation.uuid(message?)
Validation.ip(message?)
Validation.ipv4(message?)
Validation.ipv6(message?)
Validation.json(message?)
Validation.boolean(message?)
Validation.array(message?)
Validation.object(message?)
Validation.accepted(message?)
Validation.present(message?)
Validation.filled(message?)
Validation.timezone(message?)
```

### validateRequest Middleware

Middleware function to validate requests.

```typescript
import { validateRequest } from 'noderex';
import { CreateUserRequest } from './Requests/CreateUserRequest';

router.post('/users', validateRequest(CreateUserRequest), 'UserController@store');
```

After validation, `req.body` contains only validated fields.

## Resources

### Base Resource Class

The `Resource` class provides data transformation for API responses.

#### Methods

##### `transform(): Record<string, any>`

Transform the resource data (abstract method, must be implemented).

```typescript
public transform(): Record<string, any> {
  return {
    id: this.resource.id,
    name: this.resource.name,
    email: this.resource.email,
  };
}
```

##### `toArray(): Record<string, any>`

Get transformed data as array.

```typescript
const data = resource.toArray();
```

##### `toJSON(): string`

Get transformed data as JSON string.

```typescript
const json = resource.toJSON();
```

##### `hide(attributes: string[]): Record<string, any>`

Hide specified attributes.

```typescript
const safe = this.hide(['password', 'api_token']);
```

##### `only(attributes: string[]): Record<string, any>`

Show only specified attributes.

```typescript
const public = this.only(['id', 'name', 'email']);
```

##### `append(data: Record<string, any>): Record<string, any>`

Append additional data.

```typescript
const extended = this.append({ extra: 'data' });
```

##### `when(condition: boolean, value: any, defaultValue?: any): any`

Conditionally include data.

```typescript
const data = this.when(user.isAdmin, { adminData: 'value' });
```

##### `whenCallback(condition: boolean, callback: () => any, defaultValue?: any): any`

Conditionally include data via callback.

```typescript
const data = this.whenCallback(user.isAdmin, () => expensiveOperation());
```

#### Static Methods

##### `make(resource: any): Resource`

Create a resource instance.

```typescript
const resource = UserResource.make(user);
```

##### `collection(resources: any[]): Resource[]`

Create a collection of resources.

```typescript
const resources = UserResource.collection(users);
```

##### `transformCollection(resources: any[]): Record<string, any>[]`

Transform a collection of resources.

```typescript
const data = UserResource.transformCollection(users);
```

## Router

### Router Class

The `Router` class provides Laravel-style routing.

#### Methods

##### `get(path: string, handler: string | Function, middleware?: string[]): RouteDefinition`

Define a GET route.

```typescript
router.get('/users', 'UserController@index');
router.get('/users/:id', (req, res) => {
  res.json({ message: 'Hello' });
});
```

##### `post(path: string, handler: string | Function, middleware?: string[]): RouteDefinition`

Define a POST route.

```typescript
router.post('/users', 'UserController@store');
```

##### `put(path: string, handler: string | Function, middleware?: string[]): RouteDefinition`

Define a PUT route.

##### `patch(path: string, handler: string | Function, middleware?: string[]): RouteDefinition`

Define a PATCH route.

##### `delete(path: string, handler: string | Function, middleware?: string[]): RouteDefinition`

Define a DELETE route.

##### `any(path: string, handler: string | Function, middleware?: string[]): RouteDefinition`

Define a route that accepts any HTTP method.

##### `group(prefix: string, callback: (router: Router) => void, middleware?: string[]): void`

Define route groups.

```typescript
router.group('/api/v1', (router) => {
  router.get('/users', 'UserController@index');
  router.post('/users', 'UserController@store');
}, ['auth']);
```

##### `resource(name: string, controller: string, middleware?: string[]): void`

Define resource routes (RESTful with create/edit views).

```typescript
router.resource('users', 'UserController');
```

##### `apiResource(name: string, controller: string, middleware?: string[]): void`

Define API resource routes (RESTful without create/edit views).

```typescript
router.apiResource('users', 'UserController');
```

##### `middleware(name: string, handler: Function): void`

Register middleware.

```typescript
router.middleware('auth', (req, res, next) => {
  // Authentication logic
  next();
});
```

##### `registerRoutes(): void`

Register all routes with Express.

```typescript
router.registerRoutes();
```

## Migrations

### Base Migration Class

The `Migration` class provides database migration functionality.

#### Methods

##### `up(queryRunner: QueryRunner): Promise<void>`

Run the migration (abstract method, must be implemented).

##### `down(queryRunner: QueryRunner): Promise<void>`

Rollback the migration (abstract method, must be implemented).

##### `createTable(queryRunner: QueryRunner, table: Table): Promise<void>`

Create a table.

##### `dropTable(queryRunner: QueryRunner, tableName: string): Promise<void>`

Drop a table.

##### `addColumn(queryRunner: QueryRunner, tableName: string, column: TableColumn): Promise<void>`

Add a column to a table.

##### `dropColumn(queryRunner: QueryRunner, tableName: string, columnName: string): Promise<void>`

Drop a column from a table.

##### `addIndex(queryRunner: QueryRunner, tableName: string, index: TableIndex): Promise<void>`

Add an index to a table.

##### `dropIndex(queryRunner: QueryRunner, indexName: string): Promise<void>`

Drop an index from a table.

##### `tableExists(queryRunner: QueryRunner, tableName: string): Promise<boolean>`

Check if a table exists.

##### `columnExists(queryRunner: QueryRunner, tableName: string, columnName: string): Promise<boolean>`

Check if a column exists.

##### `indexExists(queryRunner: QueryRunner, tableName: string, indexName: string): Promise<boolean>`

Check if an index exists.

### Schema Helper

The `Schema` helper provides methods for creating table columns:

```typescript
import { Schema, Index } from 'noderex';

Schema.id()                    // Primary key
Schema.string(name, length?, nullable?)
Schema.text(name, nullable?)
Schema.integer(name, nullable?)
Schema.boolean(name, nullable?)
Schema.timestamp(name, nullable?)
Schema.date(name, nullable?)
Schema.json(name, nullable?)
Schema.timestamps()            // created_at, updated_at
Schema.softDeletes()           // deleted_at
Schema.foreignId(name, nullable?)
```

## Seeders

### Base Seeder Class

The `Seeder` class provides database seeding functionality.

#### Methods

##### `run(): Promise<void>`

Run the seeder (abstract method, must be implemented).

##### `create<T>(entityClass: new () => T, records: Partial<T>[]): Promise<void>`

Create records using entity class.

```typescript
await this.create(User, [
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' },
]);
```

##### `createRaw(tableName: string, records: Record<string, any>[]): Promise<void>`

Create records using raw SQL.

```typescript
await this.createRaw('users', [
  { name: 'John', email: 'john@example.com' },
]);
```

##### `query(sql: string, parameters?: any[]): Promise<any>`

Execute raw SQL query.

```typescript
const users = await this.query('SELECT * FROM users WHERE active = ?', [true]);
```

## Logger

### Logger Class

The `Logger` class provides structured logging.

#### Methods

##### `debug(message: string, context?: Record<string, any>): void`

Log debug message.

```typescript
Logger.debug('Processing request', { userId: 123 });
```

##### `info(message: string, context?: Record<string, any>): void`

Log info message.

```typescript
Logger.info('User created', { userId: 123, email: 'user@example.com' });
```

##### `warn(message: string, context?: Record<string, any>): void`

Log warning message.

```typescript
Logger.warn('Rate limit approaching', { ip: '192.168.1.1' });
```

##### `error(message: string, error?: Error | any, context?: Record<string, any>): void`

Log error message.

```typescript
Logger.error('Operation failed', error, { context: 'additional info' });
```

##### `request(req: Request, res: Response, responseTime?: number): void`

Log HTTP request.

```typescript
Logger.request(req, res, 150); // 150ms response time
```

##### `setLevel(level: LogLevel): void`

Set log level.

```typescript
Logger.setLevel(LogLevel.DEBUG);
```

## Error Handling

### Custom Error Classes

```typescript
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  BadRequestError,
} from 'noderex';

// Throw custom errors
throw new NotFoundError('User not found');
throw new UnauthorizedError('Authentication required');
throw new BadRequestError('Invalid input');
```

### Error Handler Middleware

The error handler middleware automatically handles errors and returns appropriate responses:

- `ValidationException` → 422 with validation errors
- `UnauthorizedError` → 401
- `ForbiddenError` → 403
- `NotFoundError` → 404
- `ConflictError` → 409
- `TooManyRequestsError` → 429
- `BadRequestError` → 400
- Other errors → 500

Error responses include:
- `success: false`
- `message`: Error message
- `code`: Error code
- `timestamp`: ISO timestamp
- `path`: Request path
- `method`: HTTP method
- `errors`: Validation errors (if applicable)
- `stack`: Stack trace (development only)
