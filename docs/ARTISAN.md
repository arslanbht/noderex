# Artisan Console

## Introduction

Artisan is the command-line interface included with NodeRex. It provides a number of helpful commands that can assist you while you build your application. To view a list of all available Artisan commands, you may use the `list` command:

```bash
npm run artisan list
```

## Usage

All Artisan commands are run using the `npm run artisan` command:

```bash
npm run artisan <command>
```

## Available Commands

### Make Commands

#### `make:controller`

Create a new controller class:

```bash
npm run artisan make:controller UserController
```

The `--resource` option will generate a resource controller:

```bash
npm run artisan make:controller UserController --resource
```

The `--api` option will generate an API resource controller:

```bash
npm run artisan make:controller UserController --api
```

#### `make:model`

Create a new Eloquent model class:

```bash
npm run artisan make:model User
```

The `--migration` option will create a migration file for the model:

```bash
npm run artisan make:model User --migration
```

#### `make:migration`

Create a new migration file:

```bash
npm run artisan make:migration create_users_table
```

The `--create` option specifies the name of the table to be created:

```bash
npm run artisan make:migration create_users_table --create=users
```

The `--table` option specifies the name of the table to be modified:

```bash
npm run artisan make:migration add_votes_to_users_table --table=users
```

#### `make:request`

Create a new form request class:

```bash
npm run artisan make:request StorePostRequest
```

#### `make:resource`

Create a new API resource class:

```bash
npm run artisan make:resource UserResource
```

The `--collection` option will create a resource collection:

```bash
npm run artisan make:resource UserResource --collection
```

#### `make:middleware`

Create a new middleware class:

```bash
npm run artisan make:middleware EnsureTokenIsValid
```

#### `make:seeder`

Create a new seeder class:

```bash
npm run artisan make:seeder UserSeeder
```

### Database Commands

#### `migrate`

Run the database migrations:

```bash
npm run artisan migrate
```

#### `migrate:rollback`

Rollback the last database migration:

```bash
npm run artisan migrate:rollback
```

#### `migrate:reset`

Rollback all database migrations:

```bash
npm run artisan migrate:reset
```

#### `migrate:refresh`

Rollback and re-run all migrations:

```bash
npm run artisan migrate:refresh
```

#### `migrate:status`

Show the status of each migration:

```bash
npm run artisan migrate:status
```

#### `db:seed`

Seed the database with records:

```bash
npm run artisan db:seed
```

### Route Commands

#### `route:list`

List all registered routes:

```bash
npm run artisan route:list
```

#### `route:clear`

Clear the route cache:

```bash
npm run artisan route:clear
```

### Application Commands

#### `serve`

Start the development server:

```bash
npm run artisan serve
```

The `--port` option specifies the port:

```bash
npm run artisan serve --port=8080
```

#### `config:cache`

Create a cache file for faster configuration loading:

```bash
npm run artisan config:cache
```

#### `config:clear`

Remove the configuration cache file:

```bash
npm run artisan config:clear
```

## Writing Commands

In addition to the commands provided by Artisan, you may also build your own custom commands. Commands are typically stored in the `src/cli` directory; however, you are free to choose your own storage location as long as your commands can be autoloaded.

### Generating Commands

To create a new command, you may use the `make:command` Artisan command. This command will create a new command class in the `src/cli` directory. Don't worry if this directory doesn't exist in your application - it will be created the first time you run the `make:command` Artisan command:

```bash
npm run artisan make:command SendEmails
```

The generated command will include all of the properties and methods that are needed for all commands. The command's logic may be written in the `handle` method.

## Next Steps

Now that you've learned about Artisan commands, you may want to explore:

- **[Custom Commands](#writing-commands)** - Creating your own Artisan commands
- **[Scheduling](SCHEDULING.md)** - Task scheduling (coming soon)
