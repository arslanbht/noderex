# NodeRex Documentation

Welcome to the NodeRex documentation! Here you'll find comprehensive guides and API documentation for the NodeRex framework.

## Getting Started

New to NodeRex? Start here:

1. **[Installation](INSTALLATION.md)** - Get NodeRex installed and configured
2. **[The Basics](BASICS.md)** - Routing, controllers, requests, responses
3. **[Quick Start Guide](../docs/QUICK_START.md)** - Build your first application

## Core Concepts

### The Basics

- **[Routing](BASICS.md#routing)** - Define your application's routes
- **[Controllers](BASICS.md#controllers)** - Handle HTTP requests
- **[HTTP Requests](BASICS.md#http-requests)** - Accessing request data
- **[HTTP Responses](BASICS.md#http-responses)** - Returning responses
- **[Validation](VALIDATION.md)** - Form request validation
- **[Middleware](BASICS.md#middleware)** - HTTP middleware

### Database

- **[Database Configuration](DATABASE.md#configuration)** - Database setup
- **[Migrations](DATABASE.md#migrations)** - Database migrations
- **[Seeders](DATABASE.md#seeders)** - Database seeding
- **[Query Builder](DATABASE.md#query-builder)** - Database queries

### Eloquent ORM

- **[Models](ELOQUENT.md#getting-started)** - Working with models
- **[Relationships](ELOQUENT.md#relationships)** - Model relationships
- **[Query Scopes](ELOQUENT.md#query-scopes)** - Reusable query constraints
- **[Collections](ELOQUENT.md#collections)** - Working with collections
- **[Polymorphic Relationships](../docs/POLYMORPHIC_RELATIONSHIPS.md)** - Advanced relationships

### API Development

- **[API Resources](RESOURCES.md)** - Transforming API responses
- **[Validation](VALIDATION.md)** - Request validation
- **[Error Handling](../docs/BEST_PRACTICES.md#error-handling)** - Error handling best practices

## Advanced Topics

- **[Artisan CLI](ARTISAN.md)** - Command-line interface
- **[Security](SECURITY.md)** - Security best practices
- **[Helper Functions](../docs/HELPERS.md)** - Utility functions
- **[Best Practices](../docs/BEST_PRACTICES.md)** - Development guidelines

## Additional Resources

- **[Examples](../docs/EXAMPLES.md)** - Code examples
- **[API Reference](../docs/API.md)** - Complete API documentation
- **[Migration Guide](../docs/MIGRATION_GUIDE.md)** - Migrating from other frameworks
- **[Troubleshooting](../docs/TROUBLESHOOTING.md)** - Common issues and solutions

## Quick Reference

### Common Commands

```bash
# Create new project
npx noderex my-app

# Development
npm run dev

# Create model with migration
npm run artisan make:model User --migration

# Create controller
npm run artisan make:controller UserController --api

# Run migrations
npm run artisan migrate

# Seed database
npm run artisan db:seed
```

### Common Patterns

#### Basic Controller

```typescript
export class UserController extends Controller {
  public async index(): Promise<void> {
    const users = await User.find();
    this.success(UserResource.transformCollection(users));
  }
}
```

#### Form Request

```typescript
export class CreateUserRequest extends Request {
  public rules(): Record<string, any> {
    return {
      name: [Validation.required()],
      email: [Validation.required(), Validation.email()],
    };
  }
}
```

#### Model with Relationships

```typescript
export class User extends Model {
  public posts() {
    return this.hasMany(Post, 'user_id');
  }
}
```

## Need Help?

- Check the [Troubleshooting Guide](../docs/TROUBLESHOOTING.md)
- Review [Examples](../docs/EXAMPLES.md)
- Read [Best Practices](../docs/BEST_PRACTICES.md)
- Open an issue on [GitHub](https://github.com/arslanbht/noderex/issues)

---

**Happy coding! 🚀**
