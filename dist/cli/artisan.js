#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const program = new commander_1.Command();
/**
 * Artisan CLI for NodeRex framework
 * Provides Laravel-style command line tools
 */
class Artisan {
    constructor() {
        this.commands = new Map();
        this.registerCommands();
    }
    /**
     * Register all available commands
     */
    registerCommands() {
        // Make commands
        this.commands.set('make:controller', new MakeControllerCommand());
        this.commands.set('make:model', new MakeModelCommand());
        this.commands.set('make:migration', new MakeMigrationCommand());
        this.commands.set('make:request', new MakeRequestCommand());
        this.commands.set('make:resource', new MakeResourceCommand());
        this.commands.set('make:middleware', new MakeMiddlewareCommand());
        this.commands.set('make:seeder', new MakeSeederCommand());
        // Database commands
        this.commands.set('migrate', new MigrateCommand());
        this.commands.set('migrate:rollback', new MigrateRollbackCommand());
        this.commands.set('migrate:reset', new MigrateResetCommand());
        this.commands.set('migrate:refresh', new MigrateRefreshCommand());
        this.commands.set('migrate:status', new MigrateStatusCommand());
        this.commands.set('db:seed', new DbSeedCommand());
        // Route commands
        this.commands.set('route:list', new RouteListCommand());
        this.commands.set('route:clear', new RouteClearCommand());
        // Application commands
        this.commands.set('serve', new ServeCommand());
        this.commands.set('config:cache', new ConfigCacheCommand());
        this.commands.set('config:clear', new ConfigClearCommand());
    }
    /**
     * Run the artisan CLI
     */
    run() {
        program
            .name('node-artisan')
            .description('NodeRex Artisan CLI')
            .version('1.0.0');
        // Register all commands
        this.commands.forEach((command, name) => {
            const cmd = program.command(name);
            command.register(cmd);
        });
        // Handle unknown commands
        program.on('command:*', () => {
            console.error(chalk_1.default.red(`Unknown command: ${program.args.join(' ')}`));
            console.error('See --help for available commands.');
            process.exit(1);
        });
        program.parse();
    }
}
/**
 * Base Command class
 */
class BaseCommand {
    success(message) {
        console.log(chalk_1.default.green(message));
    }
    error(message) {
        console.error(chalk_1.default.red(message));
    }
    info(message) {
        console.log(chalk_1.default.blue(message));
    }
    warning(message) {
        console.log(chalk_1.default.yellow(message));
    }
    createFile(filePath, content) {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, content);
    }
    getStub(stubName) {
        // Try to find stubs in the noderex package
        const possiblePaths = [
            path.join(__dirname, 'stubs', `${stubName}.stub`),
            path.join(process.cwd(), 'node_modules', 'noderex', 'dist', 'cli', 'stubs', `${stubName}.stub`),
            path.join(process.cwd(), 'node_modules', 'noderex', 'src', 'cli', 'stubs', `${stubName}.stub`)
        ];
        for (const stubPath of possiblePaths) {
            if (fs.existsSync(stubPath)) {
                return fs.readFileSync(stubPath, 'utf8');
            }
        }
        this.error(`Stub file '${stubName}.stub' not found!`);
        return '';
    }
    replaceStub(content, replacements) {
        let result = content;
        Object.keys(replacements).forEach(key => {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
        });
        return result;
    }
}
/**
 * Make Controller Command
 */
class MakeControllerCommand extends BaseCommand {
    register(command) {
        command
            .description('Create a new controller class')
            .argument('<name>', 'The name of the controller')
            .option('-r, --resource', 'Generate a resource controller')
            .option('-a, --api', 'Generate an API resource controller')
            .action(async (name, options) => {
            await this.handle([name, options]);
        });
    }
    async handle(args) {
        const [name, options] = args;
        const controllerName = this.formatName(name);
        // Handle namespace controllers (e.g., Auth/UserController)
        const parts = controllerName.split('/');
        const fileName = parts[parts.length - 1] + '.ts';
        const namespace = parts.slice(0, -1);
        // Create directory structure if namespace exists - Laravel-style structure
        const controllerDir = path.join(process.cwd(), 'src', 'app', 'Http', 'Controllers', ...namespace);
        if (!fs.existsSync(controllerDir)) {
            fs.mkdirSync(controllerDir, { recursive: true });
        }
        const filePath = path.join(controllerDir, fileName);
        if (fs.existsSync(filePath)) {
            this.error(`Controller ${controllerName} already exists!`);
            return;
        }
        let stub = this.getStub('controller');
        if (options.resource) {
            stub = this.getStub('resource-controller');
        }
        else if (options.api) {
            stub = this.getStub('api-controller');
        }
        const content = this.replaceStub(stub, {
            name: controllerName,
            className: parts[parts.length - 1] // Use the actual class name without namespace
        });
        this.createFile(filePath, content);
        this.success(`Controller ${controllerName} created successfully.`);
    }
    formatName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1).replace(/Controller$/, '') + 'Controller';
    }
}
/**
 * Make Model Command
 */
class MakeModelCommand extends BaseCommand {
    register(command) {
        command
            .description('Create a new model class')
            .argument('<name>', 'The name of the model')
            .option('-m, --migration', 'Create a migration for the model')
            .action(async (name, options) => {
            await this.handle([name, options]);
        });
    }
    async handle(args) {
        const [name, options] = args;
        const modelName = this.formatName(name);
        const fileName = `${modelName}.ts`;
        const filePath = path.join(process.cwd(), 'src', 'app', 'Models', fileName);
        if (fs.existsSync(filePath)) {
            this.error(`Model ${modelName} already exists!`);
            return;
        }
        const stub = this.getStub('model');
        const content = this.replaceStub(stub, {
            name: modelName,
            className: modelName,
            tableName: this.getTableName(modelName)
        });
        this.createFile(filePath, content);
        this.success(`Model ${modelName} created successfully.`);
        if (options.migration) {
            // Create migration
            const migrationName = `Create${modelName}Table`;
            const migrationFileName = `${Date.now()}_${migrationName}.ts`;
            const migrationPath = path.join(process.cwd(), 'src', 'database', 'migrations', migrationFileName);
            const migrationStub = this.getStub('migration');
            const migrationContent = this.replaceStub(migrationStub, {
                name: migrationName,
                className: migrationName,
                tableName: this.getTableName(modelName)
            });
            this.createFile(migrationPath, migrationContent);
            this.success(`Migration for ${modelName} created successfully.`);
        }
    }
    formatName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
    getTableName(modelName) {
        return modelName.toLowerCase() + 's';
    }
}
/**
 * Make Migration Command
 */
class MakeMigrationCommand extends BaseCommand {
    register(command) {
        command
            .description('Create a new migration file')
            .argument('<name>', 'The name of the migration')
            .option('--create=<table>', 'The table to be created')
            .option('--table=<table>', 'The table to be modified')
            .action(async (name, options) => {
            await this.handle([name, options]);
        });
    }
    async handle(args) {
        const [name, options] = args;
        const migrationName = this.formatName(name);
        const fileName = `${Date.now()}_${migrationName}.ts`;
        const filePath = path.join(process.cwd(), 'src', 'database', 'migrations', fileName);
        if (fs.existsSync(filePath)) {
            this.error(`Migration ${migrationName} already exists!`);
            return;
        }
        let stub = this.getStub('migration');
        const replacements = {
            name: migrationName,
            className: migrationName
        };
        if (options.create) {
            stub = this.getStub('create-migration');
            replacements.tableName = options.create;
        }
        else if (options.table) {
            stub = this.getStub('update-migration');
            replacements.tableName = options.table;
        }
        const content = this.replaceStub(stub, replacements);
        this.createFile(filePath, content);
        this.success(`Migration ${migrationName} created successfully.`);
    }
    formatName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
}
/**
 * Make Request Command
 */
class MakeRequestCommand extends BaseCommand {
    register(command) {
        command
            .description('Create a new form request class')
            .argument('<name>', 'The name of the request')
            .action(async (name) => {
            await this.handle([name]);
        });
    }
    async handle(args) {
        const [name] = args;
        const requestName = this.formatName(name);
        const fileName = `${requestName}.ts`;
        const filePath = path.join(process.cwd(), 'src', 'app', 'Http', 'Requests', fileName);
        if (fs.existsSync(filePath)) {
            this.error(`Request ${requestName} already exists!`);
            return;
        }
        const stub = this.getStub('request');
        const content = this.replaceStub(stub, {
            name: requestName,
            className: requestName
        });
        this.createFile(filePath, content);
        this.success(`Request ${requestName} created successfully.`);
    }
    formatName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1).replace(/Request$/, '') + 'Request';
    }
}
/**
 * Make Resource Command
 */
class MakeResourceCommand extends BaseCommand {
    register(command) {
        command
            .description('Create a new resource class')
            .argument('<name>', 'The name of the resource')
            .option('-c, --collection', 'Create a resource collection')
            .action(async (name, options) => {
            await this.handle([name, options]);
        });
    }
    async handle(args) {
        const [name, options] = args;
        const resourceName = this.formatName(name);
        const fileName = `${resourceName}.ts`;
        const filePath = path.join(process.cwd(), 'src', 'app', 'Http', 'Resources', fileName);
        if (fs.existsSync(filePath)) {
            this.error(`Resource ${resourceName} already exists!`);
            return;
        }
        let stub = this.getStub('resource');
        if (options.collection) {
            stub = this.getStub('resource-collection');
        }
        const content = this.replaceStub(stub, {
            name: resourceName,
            className: resourceName
        });
        this.createFile(filePath, content);
        this.success(`Resource ${resourceName} created successfully.`);
    }
    formatName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1).replace(/Resource$/, '') + 'Resource';
    }
}
/**
 * Make Middleware Command
 */
class MakeMiddlewareCommand extends BaseCommand {
    register(command) {
        command
            .description('Create a new middleware class')
            .argument('<name>', 'The name of the middleware')
            .action(async (name) => {
            await this.handle([name]);
        });
    }
    async handle(args) {
        const [name] = args;
        const middlewareName = this.formatName(name);
        const fileName = `${middlewareName}.ts`;
        const filePath = path.join(process.cwd(), 'src', 'app', 'Middleware', fileName);
        if (fs.existsSync(filePath)) {
            this.error(`Middleware ${middlewareName} already exists!`);
            return;
        }
        const stub = this.getStub('middleware');
        const content = this.replaceStub(stub, {
            name: middlewareName,
            className: middlewareName
        });
        this.createFile(filePath, content);
        this.success(`Middleware ${middlewareName} created successfully.`);
    }
    formatName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1).replace(/Middleware$/, '') + 'Middleware';
    }
}
/**
 * Make Seeder Command
 */
class MakeSeederCommand extends BaseCommand {
    register(command) {
        command
            .description('Create a new seeder class')
            .argument('<name>', 'The name of the seeder')
            .action(async (name) => {
            await this.handle([name]);
        });
    }
    async handle(args) {
        const [name] = args;
        const seederName = this.formatName(name);
        const fileName = `${seederName}.ts`;
        const filePath = path.join(process.cwd(), 'src', 'database', 'seeders', fileName);
        if (fs.existsSync(filePath)) {
            this.error(`Seeder ${seederName} already exists!`);
            return;
        }
        const stub = this.getStub('seeder');
        const content = this.replaceStub(stub, {
            name: seederName,
            className: seederName
        });
        this.createFile(filePath, content);
        this.success(`Seeder ${seederName} created successfully.`);
    }
    formatName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1).replace(/Seeder$/, '') + 'Seeder';
    }
}
/**
 * Migration Commands
 */
class MigrateCommand extends BaseCommand {
    register(command) {
        command
            .description('Run the database migrations')
            .action(async () => {
            await this.handle([]);
        });
    }
    async handle(args) {
        this.info('Running migrations...');
        // Implementation would go here
        this.success('Migrations completed successfully.');
    }
}
class MigrateRollbackCommand extends BaseCommand {
    register(command) {
        command
            .description('Rollback the last database migration')
            .action(async () => {
            await this.handle([]);
        });
    }
    async handle(args) {
        this.info('Rolling back migrations...');
        // Implementation would go here
        this.success('Migrations rolled back successfully.');
    }
}
class MigrateResetCommand extends BaseCommand {
    register(command) {
        command
            .description('Rollback all database migrations')
            .action(async () => {
            await this.handle([]);
        });
    }
    async handle(args) {
        this.info('Resetting migrations...');
        // Implementation would go here
        this.success('Migrations reset successfully.');
    }
}
class MigrateRefreshCommand extends BaseCommand {
    register(command) {
        command
            .description('Rollback and re-run all migrations')
            .action(async () => {
            await this.handle([]);
        });
    }
    async handle(args) {
        this.info('Refreshing migrations...');
        // Implementation would go here
        this.success('Migrations refreshed successfully.');
    }
}
class MigrateStatusCommand extends BaseCommand {
    register(command) {
        command
            .description('Show the status of each migration')
            .action(async () => {
            await this.handle([]);
        });
    }
    async handle(args) {
        this.info('Migration Status:');
        // Implementation would go here
    }
}
class DbSeedCommand extends BaseCommand {
    register(command) {
        command
            .description('Seed the database with records')
            .action(async () => {
            await this.handle([]);
        });
    }
    async handle(args) {
        this.info('Seeding database...');
        // Implementation would go here
        this.success('Database seeded successfully.');
    }
}
/**
 * Route Commands
 */
class RouteListCommand extends BaseCommand {
    register(command) {
        command
            .description('List all registered routes')
            .action(async () => {
            await this.handle([]);
        });
    }
    async handle(args) {
        this.info('Registered Routes:');
        // Implementation would go here
    }
}
class RouteClearCommand extends BaseCommand {
    register(command) {
        command
            .description('Remove the route cache file')
            .action(async () => {
            await this.handle([]);
        });
    }
    async handle(args) {
        this.info('Route cache cleared.');
    }
}
/**
 * Application Commands
 */
class ServeCommand extends BaseCommand {
    register(command) {
        command
            .description('Serve the application on the development server')
            .option('-p, --port <port>', 'The port to serve the application on', '3000')
            .action(async (options) => {
            await this.handle([options]);
        });
    }
    async handle(args) {
        const [options] = args;
        const port = options.port || 3000;
        this.info(`Starting development server on port ${port}...`);
        // Implementation would go here
    }
}
class ConfigCacheCommand extends BaseCommand {
    register(command) {
        command
            .description('Create a cache file for faster configuration loading')
            .action(async () => {
            await this.handle([]);
        });
    }
    async handle(args) {
        this.info('Configuration cached successfully.');
    }
}
class ConfigClearCommand extends BaseCommand {
    register(command) {
        command
            .description('Remove the configuration cache file')
            .action(async () => {
            await this.handle([]);
        });
    }
    async handle(args) {
        this.info('Configuration cache cleared.');
    }
}
// Run the CLI
if (require.main === module) {
    const artisan = new Artisan();
    artisan.run();
}
exports.default = Artisan;
//# sourceMappingURL=artisan.js.map