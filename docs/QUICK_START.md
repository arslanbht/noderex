# NodeRex Quick Start Guide

Get up and running with NodeRex in minutes!

## Installation

### Option 1: Create New Project (Recommended)

```bash
npx noderex my-app
cd my-app
npm install
npm run dev
```

### Option 2: Manual Installation

```bash
npm install noderex express typeorm reflect-metadata
npm install -D typescript ts-node @types/node @types/express
```

## Project Setup

### 1. Create Project Structure

```
my-app/
├── src/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   ├── Requests/
│   │   │   └── Resources/
│   │   ├── Models/
│   │   └── Middleware/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
├── .env
├── package.json
└── tsconfig.json
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env`:
```env
APP_NAME=MyApp
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:3000
PORT=3000

DB_CONNECTION=sqlite
DB_DATABASE=database.sqlite

JWT_SECRET=your-secret-key-change-this
```

### 3. Create Main Application File

`src/index.ts`:
```typescript
import 'reflect-metadata';
import { NodeRexApplication } from 'noderex';
import { setupRoutes } from './routes/web';

const app = new NodeRexApplication();
const router = app.getRouter();

setupRoutes(router);
router.registerRoutes();

app.start().catch(console.error);
```

### 4. Create Routes File

`src/routes/web.ts`:
```typescript
import { Router } from 'noderex';

export function setupRoutes(router: Router): void {
  router.get('/health', (req, res) => {
    res.json({ success: true, message: 'API is running' });
  });

  router.group('/api', (router) => {
    router.apiResource('users', 'UserController');
  });
}
```

## Your First Model

### 1. Create Migration

```bash
npm run artisan make:migration CreateUsersTable --create=users
```

Edit the migration:
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
        ...Schema.timestamps(),
      ],
      indices: [
        Index.unique('users_email_unique', ['email']),
      ],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.dropTable(queryRunner, 'users');
  }
}
```

### 2. Create Model

```bash
npm run artisan make:model User --migration
```

Edit the model:
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

  public toJSON(): Record<string, any> {
    return this.hidden(['password']);
  }
}
```

### 3. Run Migration

```bash
npm run artisan migrate
```

## Your First Controller

### 1. Create Controller

```bash
npm run artisan make:controller UserController --api
```

Edit the controller:
```typescript
import { Controller } from 'noderex';
import { User } from '../Models/User';
import { UserResource } from '../Resources/UserResource';
import { NotFoundError } from 'noderex';

export class UserController extends Controller {
  public async index(): Promise<void> {
    const users = await User.find();
    const data = UserResource.transformCollection(users);
    this.success(data);
  }

  public async show(): Promise<void> {
    const id = parseInt(this.input('id'));
    const user = await User.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    this.success(UserResource.make(user).toArray());
  }

  public async store(): Promise<void> {
    const user = new User();
    user.fill(this.all());
    await user.save();
    this.created(UserResource.make(user).toArray());
  }

  public async update(): Promise<void> {
    const id = parseInt(this.input('id'));
    const user = await User.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.fill(this.all());
    await user.save();
    this.success(UserResource.make(user).toArray());
  }

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

## Your First Request Validation

### 1. Create Request

```bash
npm run artisan make:request CreateUserRequest
```

Edit the request:
```typescript
import { Request, Validation } from 'noderex';

export class CreateUserRequest extends Request {
  public rules(): Record<string, any> {
    return {
      name: [
        Validation.required('Name is required'),
        Validation.min(2, 'Name must be at least 2 characters'),
      ],
      email: [
        Validation.required('Email is required'),
        Validation.email('Email must be valid'),
      ],
      password: [
        Validation.required('Password is required'),
        Validation.min(8, 'Password must be at least 8 characters'),
      ],
    };
  }
}
```

### 2. Update Route

```typescript
import { validateRequest } from 'noderex';
import { CreateUserRequest } from './app/Http/Requests/CreateUserRequest';

router.post('/api/users', validateRequest(CreateUserRequest), 'UserController@store');
```

## Your First Resource

### 1. Create Resource

```bash
npm run artisan make:resource UserResource
```

Edit the resource:
```typescript
import { Resource } from 'noderex';

export class UserResource extends Resource {
  public transform(): Record<string, any> {
    return {
      id: this.resource.id,
      name: this.resource.name,
      email: this.resource.email,
      created_at: this.resource.created_at,
      updated_at: this.resource.updated_at,
    };
  }
}
```

## Testing Your API

### Start Development Server

```bash
npm run dev
```

### Test Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Get all users
curl http://localhost:3000/api/users

# Create user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"secret123"}'

# Get user
curl http://localhost:3000/api/users/1

# Update user
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe"}'

# Delete user
curl -X DELETE http://localhost:3000/api/users/1
```

## Next Steps

1. **Add Relationships**: See `RELATIONSHIPS_AND_SCOPES_GUIDE.md`
2. **Add Query Scopes**: See `RELATIONSHIPS_AND_SCOPES_GUIDE.md`
3. **Add Middleware**: See `docs/EXAMPLES.md`
4. **Add Authentication**: Implement JWT authentication
5. **Add Tests**: Write unit and integration tests

## Common Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Artisan Commands
npm run artisan make:controller <name>    # Create controller
npm run artisan make:model <name>         # Create model
npm run artisan make:migration <name>     # Create migration
npm run artisan make:request <name>       # Create request
npm run artisan make:resource <name>      # Create resource
npm run artisan migrate                   # Run migrations
npm run artisan db:seed                   # Seed database

# Testing
npm test                 # Run tests
npm run test:watch      # Watch mode
npm run test:coverage    # Coverage report
```

## Troubleshooting

### Database Connection Issues

1. Check `.env` file has correct database configuration
2. Ensure database exists (for MySQL/PostgreSQL)
3. Check database credentials

### TypeScript Errors

1. Run `npm run build` to check for type errors
2. Ensure `tsconfig.json` is properly configured
3. Check that all imports are correct

### Route Not Found

1. Ensure `router.registerRoutes()` is called
2. Check route path matches exactly
3. Verify controller method exists

### Validation Errors

1. Check Request class `rules()` method
2. Verify validation middleware is applied
3. Check error response format

## Resources

- [API Documentation](./API.md)
- [Examples](./EXAMPLES.md)
- [Best Practices](./BEST_PRACTICES.md)
- [Relationships Guide](../RELATIONSHIPS_AND_SCOPES_GUIDE.md)

Happy coding! 🚀
