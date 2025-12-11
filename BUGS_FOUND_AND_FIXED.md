# Bugs Found and Fixed in NodeRex Framework

## Summary
This document lists all bugs found and fixed in the NodeRex Laravel-style Node.js framework.

## Bugs Fixed

### 1. ✅ Migration.ts - Database-Specific SQL Queries (CRITICAL)
**Location:** `src/database/migrations/Migration.ts` (lines 113, 121, 129)

**Issue:** 
- `tableExists()`, `columnExists()`, and `indexExists()` methods used MySQL-specific SQL (`SHOW TABLES`, `SHOW COLUMNS`, `SHOW INDEX`)
- These queries would fail when using SQLite or PostgreSQL databases
- The framework claims to support MySQL, PostgreSQL, and SQLite, but these methods only worked with MySQL

**Fix:**
- Implemented database-agnostic queries that work with all three database types
- Added proper SQL queries for PostgreSQL (using `information_schema` and `pg_indexes`)
- Added proper SQL queries for SQLite (using `sqlite_master` and `PRAGMA table_info`)
- Maintained MySQL compatibility using parameterized queries

### 2. ✅ Migration.ts - SQL Injection Vulnerabilities (SECURITY)
**Location:** `src/database/migrations/Migration.ts` (lines 80, 90, 93, 103, 113, 121, 129)

**Issue:**
- Table and column names were directly interpolated into SQL strings without proper escaping
- Methods affected: `insert()`, `update()`, `delete()`, `tableExists()`, `columnExists()`, `indexExists()`
- This created SQL injection vulnerabilities

**Fix:**
- Added `escapeIdentifier()` method that properly escapes identifiers based on database type
- Implemented identifier validation to ensure only safe characters are used
- Used proper escaping for MySQL (backticks), PostgreSQL (double quotes), and SQLite (double quotes)
- Applied escaping to all SQL queries that use table/column names

### 3. ✅ Seeder.ts - Incorrect TypeORM Usage (CRITICAL)
**Location:** `src/database/seeders/Seeder.ts` (line 26)

**Issue:**
- `create()` method called `getRepository(tableName)` with a string table name
- TypeORM's `getRepository()` expects an entity class, not a table name string
- This would cause runtime errors when trying to seed the database

**Fix:**
- Changed `create()` method signature to accept an entity class instead of table name
- Added new `createRaw()` method for cases where raw SQL insertion by table name is needed
- Updated method documentation to clarify the correct usage

### 4. ✅ Controller.ts - Falsy Value Bug (LOGIC ERROR)
**Location:** `src/app/Http/Controllers/Controller.ts` (line 53)

**Issue:**
- `input()` method used `||` operator instead of `??` (nullish coalescing)
- This caused falsy values like `0`, `false`, or empty string `""` to be replaced with the default value
- Example: `input('age', 18)` would return `18` if the actual value was `0`

**Fix:**
- Changed `||` to `??` operator to only use default value for `null` or `undefined`
- Now correctly handles falsy values like `0`, `false`, and empty strings

### 5. ✅ Router.ts - Excessive Logging (PERFORMANCE/NOISE)
**Location:** `src/routes/Router.ts` (lines 318, 339)

**Issue:**
- Console.log statements printed for every controller import attempt
- Console.log statements printed for every successful controller import
- This would create excessive noise in production logs and slow down route registration

**Fix:**
- Removed debug console.log statements from controller import logic
- Kept only essential error logging

### 6. ✅ Router.ts - Missing Middleware in Group Routes (BUG)
**Location:** `src/routes/Router.ts` (line 87)

**Issue:**
- `group()` method created a new Router instance but didn't copy the middleware map
- Routes defined inside a group couldn't access middleware registered on the parent router
- This broke middleware functionality when using route groups

**Fix:**
- Added code to copy parent router's middleware map to child router
- Now middleware registered on parent router is available to routes in groups

### 7. ✅ Model.ts - Incomplete toJSON() Implementation (BUG)
**Location:** `src/app/Models/Model.ts` (line 34)

**Issue:**
- `toJSON()` method used `Object.keys(this)` which only returns enumerable own properties
- TypeORM column properties might not be included in the JSON output
- This could cause missing data when serializing models

**Fix:**
- Changed to use `Object.getOwnPropertyNames()` to get all properties including non-enumerable ones
- Added filtering to skip internal TypeORM methods and functions
- Now properly includes all TypeORM column properties in JSON output

## Known Issues (Not Fixed - Require Design Changes)

### 8. ⚠️ Request.ts - Validation System Mismatch (DESIGN ISSUE)
**Location:** `src/app/Http/Requests/Request.ts` (line 29)

**Issue:**
- The `validate()` method calls `class-validator`'s `validate(this)` which expects decorators on class properties
- However, the framework uses a `rules()` method that returns a plain object of validation rules
- The `rules()` method is never actually used in the validation process
- This means validation won't work as expected - it will only validate based on decorators, not the `rules()` method

**Impact:**
- Request validation using the `rules()` method won't work
- Users would need to use `class-validator` decorators instead, which defeats the purpose of the `rules()` method

**Recommendation:**
- Either implement a custom validation system that uses the `rules()` method
- Or update the documentation to use decorators instead of `rules()`
- Or remove the `rules()` method and use decorators exclusively

## Testing Recommendations

1. Test migrations with all three database types (MySQL, PostgreSQL, SQLite)
2. Test Seeder with actual entity classes
3. Test Controller input() method with falsy values (0, false, "")
4. Test route groups with middleware
5. Test Model.toJSON() with TypeORM entities
6. Review Request validation system and decide on approach

## Files Modified

1. `src/database/migrations/Migration.ts` - Fixed database compatibility and SQL injection
2. `src/database/seeders/Seeder.ts` - Fixed TypeORM usage
3. `src/app/Http/Controllers/Controller.ts` - Fixed falsy value handling
4. `src/routes/Router.ts` - Fixed logging and middleware in groups
5. `src/app/Models/Model.ts` - Fixed toJSON() implementation
