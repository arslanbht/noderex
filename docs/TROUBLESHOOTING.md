# Troubleshooting Guide

Common issues and solutions when working with NodeRex.

## Table of Contents

- [Database Issues](#database-issues)
- [TypeScript Issues](#typescript-issues)
- [Routing Issues](#routing-issues)
- [Validation Issues](#validation-issues)
- [Relationship Issues](#relationship-issues)
- [Performance Issues](#performance-issues)
- [Build Issues](#build-issues)

## Database Issues

### Connection Failed

**Error:** `Database connection failed`

**Solutions:**
1. Check `.env` file has correct database configuration
2. Verify database server is running
3. Check database credentials
4. Ensure database exists (for MySQL/PostgreSQL)
5. Check network connectivity

```env
DB_CONNECTION=sqlite
DB_DATABASE=database.sqlite
# OR
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=mydb
DB_USERNAME=root
DB_PASSWORD=password
```

### Migration Errors

**Error:** `Migration failed` or `Table already exists`

**Solutions:**
1. Check if migration was already run
2. Rollback and re-run: `npm run artisan migrate:rollback`
3. Check migration file syntax
4. Verify table doesn't exist with different name

### Seeder Errors

**Error:** `Database connection not available`

**Solutions:**
1. Ensure database is connected before seeding
2. Check seeder is using correct entity class
3. Verify entity is registered in TypeORM config

```typescript
// Correct
await this.create(User, [{ name: 'John' }]);

// Incorrect
await this.create('users', [{ name: 'John' }]);
```

## TypeScript Issues

### Type Errors

**Error:** `Property 'x' does not exist on type 'y'`

**Solutions:**
1. Ensure model properties are properly typed
2. Use `!` for required properties: `name!: string;`
3. Check imports are correct
4. Run `npm run build` to see all type errors

### Module Not Found

**Error:** `Cannot find module 'noderex'`

**Solutions:**
1. Install dependencies: `npm install`
2. Check `package.json` has noderex
3. Verify node_modules exists
4. Try deleting node_modules and reinstalling

### Decorator Errors

**Error:** `Experimental decorators warning`

**Solutions:**
1. Ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

2. Check TypeScript version (should be 4.5+)

## Routing Issues

### Route Not Found (404)

**Error:** Route returns 404

**Solutions:**
1. Ensure `router.registerRoutes()` is called
2. Check route path matches exactly (case-sensitive)
3. Verify HTTP method matches (GET, POST, etc.)
4. Check route is registered before error handlers

```typescript
// Correct order
router.get('/users', 'UserController@index');
router.registerRoutes(); // Must be called
app.start(); // Error handlers setup here
```

### Controller Not Found

**Error:** `Controller UserController not found`

**Solutions:**
1. Check controller file exists in correct location
2. Verify controller class name matches
3. Ensure controller is exported
4. Check file path matches Router expectations

**Expected locations:**
- `src/app/Http/Controllers/UserController.ts`
- `dist/app/Http/Controllers/UserController.js`

### Method Not Found

**Error:** `Method index not found in controller`

**Solutions:**
1. Verify method exists in controller
2. Check method is public
3. Ensure method name matches route handler
4. Check for typos in method name

## Validation Issues

### Validation Not Working

**Error:** Validation passes when it shouldn't

**Solutions:**
1. Ensure `validateRequest` middleware is applied
2. Check Request class `rules()` method returns rules
3. Verify rules are in correct format
4. Check validation middleware is before controller

```typescript
// Correct
router.post('/users', validateRequest(CreateUserRequest), 'UserController@store');

// Incorrect
router.post('/users', 'UserController@store', validateRequest(CreateUserRequest));
```

### Validation Errors Not Showing

**Error:** No validation errors returned

**Solutions:**
1. Check error handler middleware is registered
2. Verify ValidationException is imported
3. Check custom messages format
4. Ensure error handler is after routes

### Custom Messages Not Working

**Error:** Default messages shown instead of custom

**Solutions:**
1. Check `messages()` method format
2. Verify message key matches rule type
3. Ensure messages method returns object

```typescript
// Correct format
public messages(): Record<string, string> {
  return {
    'email.required': 'Email is required',
    'email.email': 'Invalid email format',
  };
}
```

## Relationship Issues

### Relationship Returns Empty

**Error:** `get()` returns empty array/null

**Solutions:**
1. Check foreign key column exists
2. Verify foreign key value is set
3. Ensure parent model is saved before accessing relationship
4. Check relationship definition is correct

```typescript
// Ensure parent is saved first
const user = new User();
user.name = 'John';
await user.save(); // Must save first

// Now relationship works
const posts = await user.posts().get();
```

### Foreign Key Mismatch

**Error:** Relationship doesn't find related models

**Solutions:**
1. Verify foreign key column name matches
2. Check foreign key value matches parent id
3. Ensure data types match (both integers, etc.)
4. Check database constraints

### BelongsToMany Not Working

**Error:** Many-to-many relationship fails

**Solutions:**
1. Verify pivot table exists
2. Check pivot table column names
3. Ensure pivot table has correct foreign keys
4. Verify relationship parameters match table structure

```typescript
// Check pivot table structure matches
public roles() {
  return this.belongsToMany(
    Role,
    'user_roles',      // Pivot table name
    'user_id',         // Foreign key in pivot
    'role_id'          // Related key in pivot
  );
}
```

## Performance Issues

### Slow Queries

**Error:** Queries take too long

**Solutions:**
1. Add database indexes
2. Use eager loading instead of lazy loading
3. Limit query results
4. Use query scopes to filter early

```typescript
// Add index in migration
Index.index('users_email_index', ['email']);

// Use eager loading
const users = await User.find({ relations: ['posts'] });

// Limit results
const users = await User.find({ take: 10 });
```

### N+1 Query Problem

**Error:** Too many database queries

**Solutions:**
1. Use eager loading
2. Use `with()` method for relationships
3. Load relationships in single query

```typescript
// Bad - N+1 queries
const users = await User.find();
for (const user of users) {
  const posts = await user.posts().get(); // N queries
}

// Good - Single query
const users = await User.find({ relations: ['posts'] });
```

### Memory Issues

**Error:** High memory usage

**Solutions:**
1. Limit query results
2. Use pagination
3. Process data in batches
4. Avoid loading all records at once

```typescript
// Use pagination
const page = 1;
const limit = 50;
const users = await User.find({
  skip: (page - 1) * limit,
  take: limit,
});
```

## Build Issues

### Build Fails

**Error:** TypeScript compilation errors

**Solutions:**
1. Check all type errors: `npm run build`
2. Fix type issues
3. Ensure all imports are correct
4. Check `tsconfig.json` configuration

### Missing Dependencies

**Error:** Module not found during build

**Solutions:**
1. Run `npm install`
2. Check `package.json` dependencies
3. Verify all required packages are installed
4. Check for version conflicts

### Build Output Issues

**Error:** Files not in dist folder

**Solutions:**
1. Check `tsconfig.json` `outDir` setting
2. Verify `rootDir` is correct
3. Ensure source files are in `src/` directory
4. Check build script in `package.json`

## Common Error Messages

### "Cannot read property 'x' of undefined"

**Cause:** Trying to access property on undefined object

**Solution:** Add null checks before accessing properties

```typescript
const user = await User.findOne({ where: { id } });
if (!user) {
  throw new NotFoundError('User not found');
}
// Now safe to use user
```

### "Validation failed"

**Cause:** Request validation errors

**Solution:** Check validation errors in response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required"]
  }
}
```

### "Route not found"

**Cause:** Route doesn't exist or not registered

**Solution:** 
1. Check route is defined
2. Verify `registerRoutes()` is called
3. Check route path matches request

### "Database connection failed"

**Cause:** Database configuration issue

**Solution:**
1. Check `.env` file
2. Verify database is running
3. Test database connection

## Getting Help

If you're still experiencing issues:

1. **Check Documentation**
   - [API Documentation](./API.md)
   - [Examples](./EXAMPLES.md)
   - [Best Practices](./BEST_PRACTICES.md)

2. **Check Examples**
   - Look at example code
   - Compare with your implementation

3. **Enable Debug Mode**
   ```env
   APP_DEBUG=true
   ```
   This shows more detailed error messages

4. **Check Logs**
   - Look at console output
   - Check error messages
   - Review stack traces

5. **Open an Issue**
   - Provide error message
   - Include code snippet
   - Share environment details

## Debugging Tips

1. **Use Logger**
   ```typescript
   Logger.debug('Debug message', { data });
   ```

2. **Check Request Data**
   ```typescript
   console.log(this.all()); // In controller
   ```

3. **Verify Database State**
   ```typescript
   const count = await User.count();
   console.log(`User count: ${count}`);
   ```

4. **Test Queries Directly**
   ```typescript
   const users = await User.find();
   console.log(users);
   ```

5. **Check Middleware Order**
   - Routes should be registered before error handlers
   - Validation middleware should be before controller
