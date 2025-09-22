# NodeRex

A Laravel-styled Node.js framework built with TypeScript, featuring MVC architecture, migrations, validation, API resources, and artisan commands.

## Features

- 🏗️ **MVC Architecture** - Clean separation of concerns with Models, Views, and Controllers
- 🗄️ **Database Migrations** - TypeORM-powered database schema management
- ✅ **Validation System** - Request validation with custom rules and messages
- 🔄 **API Resources** - Data transformation for consistent API responses
- 🛣️ **Routing System** - Express-based routing with middleware support
- 🛠️ **Artisan CLI** - Laravel-style command-line tools (`node artisan`)
- 🔒 **Security** - Built-in security middleware (helmet, CORS, rate limiting)
- 📝 **TypeScript** - Full TypeScript support with decorators

## Installation

### Option 1: Create a New Project (Recommended)

Create a new NodeRex project using our CLI tool:

```bash
npx noderex my-awesome-app
cd my-awesome-app
npm run dev
```

This will create a new project with all the necessary files and dependencies.

### Option 2: Manual Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd NodeRex
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment configuration:
```bash
cp env.example .env
```

4. Update your `.env` file with your database and application settings.

5. Build the project:
```bash
npm run build
```

## Quick Start

### 1. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000` by default.

### 2. Create Your First Model

```bash
npm run artisan make:model User --migration
```

This creates:
- `src/app/Models/User.ts` - The User model
- `src/database/migrations/[timestamp]_CreateUserTable.ts` - Migration file

### 3. Create a Controller

```bash
npm run artisan make:controller UserController --resource
```

This creates `src/app/Controllers/UserController.ts` with all CRUD methods.

### 4. Create API Resources

```bash
npm run artisan make:resource UserResource
```

This creates `src/app/Http/Resources/UserResource.ts` for data transformation.

### 5. Create Request Validation

```bash
npm run artisan make:request CreateUserRequest
```

This creates `src/app/Http/Requests/CreateUserRequest.ts` for validation.

## Artisan Commands

NodeRex includes a powerful CLI tool similar to Laravel's Artisan:

### Make Commands

```bash
# Create a new controller
npm run artisan make:controller PostController --resource

# Create a new model with migration
npm run artisan make:model Post --migration

# Create a new migration
npm run artisan make:migration CreatePostsTable --create=posts

# Create a new request class
npm run artisan make:request CreatePostRequest

# Create a new resource class
npm run artisan make:resource PostResource

# Create a new middleware
npm run artisan make:middleware AuthMiddleware

# Create a new seeder
npm run artisan make:seeder PostSeeder
```

### Database Commands

```bash
# Run migrations
npm run artisan migrate

# Rollback migrations
npm run artisan migrate:rollback

# Reset migrations
npm run artisan migrate:reset

# Refresh migrations
npm run artisan migrate:refresh

# Show migration status
npm run artisan migrate:status

# Seed the database
npm run artisan db:seed
```

### Route Commands

```bash
# List all routes
npm run artisan route:list

# Clear route cache
npm run artisan route:clear
```

### Application Commands

```bash
# Start development server
npm run artisan serve --port=3000

# Cache configuration
npm run artisan config:cache

# Clear configuration cache
npm run artisan config:clear
```

## Project Structure

```
NodeRex/
├── src/
│   ├── app/
│   │   ├── Controllers/          # Application controllers
│   │   ├── Models/               # Eloquent models
│   │   ├── Middleware/           # HTTP middleware
│   │   └── Http/
│   │       ├── Requests/         # Form request classes
│   │       └── Resources/        # API resource classes
│   ├── config/                   # Configuration files
│   ├── database/
│   │   ├── migrations/           # Database migrations
│   │   └── seeders/              # Database seeders
│   ├── routes/                   # Route definitions
│   └── cli/                      # Artisan CLI commands
├── dist/                         # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## Models

Models extend the base `Model` class and use TypeORM decorators:

```typescript
import { Entity, Column, Index } from 'typeorm';
import { Model } from './Model';

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

## Controllers

Controllers extend the base `Controller` class:

```typescript
import { Controller } from './Controller';
import { User } from '../Models/User';

export class UserController extends Controller {
  public async index(): Promise<void> {
    const users = await User.find();
    this.success(users);
  }

  public async store(): Promise<void> {
    const user = new User();
    user.fill(this.all());
    await user.save();
    this.created(user);
  }
}
```

## Validation

Create request classes for validation:

```typescript
import { Request, Validation } from './Request';

export class CreateUserRequest extends Request {
  public name!: string;
  public email!: string;
  public password!: string;

  public rules(): Record<string, any> {
    return {
      name: [
        Validation.required('Name is required'),
        Validation.min(2, 'Name must be at least 2 characters')
      ],
      email: [
        Validation.required('Email is required'),
        Validation.email('Email must be valid')
      ],
      password: [
        Validation.required('Password is required'),
        Validation.min(8, 'Password must be at least 8 characters')
      ]
    };
  }
}
```

## API Resources

Transform data for API responses:

```typescript
import { Resource } from './Resource';

export class UserResource extends Resource {
  public transform(): Record<string, any> {
    return {
      id: this.resource.id,
      name: this.resource.name,
      email: this.resource.email,
      created_at: this.resource.created_at
    };
  }
}
```

## Migrations

Create and manage database schema:

```typescript
import { Migration, Schema, Index } from './Migration';

export class CreateUsersTable extends Migration {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.createTable(queryRunner, new Table({
      name: 'users',
      columns: [
        Schema.id(),
        Schema.string('name'),
        Schema.string('email'),
        Schema.string('password'),
        ...Schema.timestamps()
      ],
      indices: [
        Index.unique('users_email_unique', ['email'])
      ]
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.dropTable(queryRunner, 'users');
  }
}
```

## Routing

Define routes using the Router class:

```typescript
import { Router } from './routes/Router';

const router = new Router(app);

// Basic routes
router.get('/users', 'UserController@index');
router.post('/users', 'UserController@store');

// Resource routes
router.apiResource('users', 'UserController');

// Route groups with middleware
router.group('/api/v1', (router) => {
  router.get('/users', 'UserController@index');
}, ['auth']);

router.registerRoutes();
```

## Configuration

Configure your application in `src/config/`:

- `app.ts` - Application settings
- `database.ts` - Database configuration

Environment variables are loaded from `.env` file.

## Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Artisan CLI
npm run artisan         # Run artisan commands
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

- [ ] Frontend integration (React/Vue support)
- [ ] Authentication system
- [ ] File upload handling
- [ ] Email system
- [ ] Caching system
- [ ] Queue system
- [ ] Testing framework
- [ ] Documentation site
