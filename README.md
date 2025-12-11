# NodeRex

> A Laravel-styled Node.js framework built with TypeScript

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

## Introduction

NodeRex is a powerful, expressive Node.js framework built with TypeScript. It provides an elegant syntax and robust features that make building modern web applications enjoyable and productive.

NodeRex follows Laravel's conventions and patterns, making it familiar to Laravel developers while leveraging the power of TypeScript and Node.js.

## Key Features

- 🏗️ **MVC Architecture** - Clean separation of concerns
- 🗄️ **Database Migrations** - Version control for your database
- ✅ **Validation** - 50+ Laravel-style validation rules
- 🔄 **API Resources** - Transform data for consistent API responses
- 🛣️ **Routing** - Expressive, fluent routing system
- 🔗 **Relationships** - Eloquent-style relationships (HasMany, BelongsTo, MorphTo, etc.)
- 🔍 **Query Scopes** - Reusable query constraints
- 🛠️ **Artisan CLI** - Command-line tools for common tasks
- 🔒 **Security** - Built-in security middleware
- 📝 **TypeScript** - Full type safety and IntelliSense support

## Installation

### Via NPM

```bash
npm install noderex express typeorm reflect-metadata
```

### Create New Project

The easiest way to get started with NodeRex is to create a new project using our CLI tool:

```bash
npx noderex my-app
cd my-app
npm install
npm run dev
```

This will create a new NodeRex project with all the necessary files and dependencies.

## Quick Start

### 1. Create Your First Model

```bash
npm run artisan make:model User --migration
```

This creates:
- `src/app/Models/User.ts` - The User model
- `src/database/migrations/[timestamp]_CreateUserTable.ts` - Migration file

### 2. Define Your Model

```typescript
import { Entity, Column } from 'typeorm';
import { Model } from 'noderex';

@Entity('users')
export class User extends Model {
  @Column()
  name!: string;

  @Column()
  email!: string;
}
```

### 3. Create a Controller

```bash
npm run artisan make:controller UserController --api
```

### 4. Define Routes

```typescript
import { Router } from 'noderex';

const router = new Router(app);
router.apiResource('users', 'UserController');
router.registerRoutes();
```

### 5. Start Development Server

```bash
npm run dev
```

Your application is now running at `http://localhost:3000`!

## Learning NodeRex

NodeRex has wonderful documentation covering every aspect of the framework. Whether you're a beginner or have prior experience with Laravel, our documentation will guide you through the framework.

### Documentation

- **[Installation & Configuration](docs/INSTALLATION.md)** - Get NodeRex installed and configured
- **[The Basics](docs/BASICS.md)** - Routing, middleware, controllers, requests, responses
- **[Database](docs/DATABASE.md)** - Query builder, migrations, seeders
- **[Eloquent ORM](docs/ELOQUENT.md)** - Models, relationships, collections
- **[Validation](docs/VALIDATION.md)** - Form validation, custom rules
- **[API Resources](docs/RESOURCES.md)** - API resource transformations
- **[Artisan CLI](docs/ARTISAN.md)** - Command-line interface
- **[Security](docs/SECURITY.md)** - Authentication, authorization, encryption

### Video Tutorials

Coming soon! We're working on video tutorials to help you learn NodeRex.

## Contributing

Thank you for considering contributing to NodeRex! The contribution guide can be found in the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## Code of Conduct

In order to ensure that the NodeRex community is welcoming to all, please review and abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Security Vulnerabilities

If you discover a security vulnerability within NodeRex, please send an e-mail to the maintainer. All security vulnerabilities will be promptly addressed.

## License

NodeRex is open-sourced software licensed under the [MIT license](LICENSE).

## Support

- [Documentation](https://github.com/arslanbht/noderex)
- [GitHub Issues](https://github.com/arslanbht/noderex/issues)
- [Discussions](https://github.com/arslanbht/noderex/discussions)

---

**Made with ❤️ for the Node.js community**
