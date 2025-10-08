#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const program = new Command();

/**
 * NodeRex Project Creator
 * Creates new NodeRex projects with basic structure
 */
class ProjectCreator {
  private projectName: string = '';
  private projectPath: string = '';

  /**
   * Create a new NodeRex project
   */
  public async createProject(projectName: string, options: any): Promise<void> {
    this.projectName = projectName;
    this.projectPath = path.resolve(projectName);

    this.info(`Creating NodeRex project: ${chalk.cyan(projectName)}`);

    // Check if directory already exists
    if (fs.existsSync(this.projectPath)) {
      this.error(`Directory ${projectName} already exists!`);
      process.exit(1);
    }

    try {
      // Create project directory
      this.createProjectDirectory();
      
      // Create package.json
      this.createPackageJson();
      
      // Create TypeScript configuration
      this.createTypeScriptConfig();
      
      // Create environment configuration
      this.createEnvFiles();
      
      // Create source directory structure
      this.createSourceStructure();
      
      // Create basic files
      this.createBasicFiles();
      
      // Install dependencies
      if (!options.skipInstall) {
        this.installDependencies();
      }

      this.success(`\n🎉 NodeRex project "${projectName}" created successfully!`);
      this.info('\nNext steps:');
      this.info(`  cd ${projectName}`);
      if (options.skipInstall) {
        this.info('  npm install');
      }
      this.info('  npm run dev');
      this.info('\n📚 Documentation: https://github.com/arslanbht/noderex');
      
    } catch (error) {
      this.error(`Failed to create project: ${error}`);
      process.exit(1);
    }
  }

  /**
   * Create project directory
   */
  private createProjectDirectory(): void {
    fs.mkdirSync(this.projectPath, { recursive: true });
    this.info('✓ Created project directory');
  }

  /**
   * Create package.json for the new project
   */
  private createPackageJson(): void {
    const packageJson = {
      name: this.projectName,
      version: "1.0.0",
      description: `A NodeRex application - ${this.projectName}`,
      main: "dist/index.js",
        scripts: {
          build: "tsc",
          dev: "ts-node src/index.ts",
          start: "node dist/index.js",
          artisan: "node-artisan"
        },
      keywords: ["noderex", "api", "mvc", "typescript"],
      author: "",
      license: "MIT",
      dependencies: {
        "noderex": "^1.0.0",
        "express": "^4.18.2",
        "typeorm": "^0.3.20",
        "class-validator": "^0.14.1",
        "class-transformer": "^0.5.1",
        "reflect-metadata": "^0.2.1",
        "commander": "^11.1.0",
        "chalk": "^4.1.2",
        "cors": "^2.8.5",
        "helmet": "^7.1.0",
        "dotenv": "^16.3.1",
        "multer": "^1.4.5-lts.1",
        "bcryptjs": "^2.4.3",
        "jsonwebtoken": "^9.0.2",
        "express-rate-limit": "^7.5.1",
        "sqlite3": "^5.1.6"
      },
      devDependencies: {
        "@types/node": "^20.10.5",
        "@types/express": "^4.17.21",
        "@types/cors": "^2.8.17",
        "@types/multer": "^1.4.11",
        "@types/bcryptjs": "^2.4.6",
        "@types/jsonwebtoken": "^9.0.5",
        "eslint": "^9.36.0",
        "prettier": "^3.6.2",
        "ts-node": "^10.9.2",
        "typescript": "^5.9.2"
      }
    };

    fs.writeFileSync(
      path.join(this.projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    this.info('✓ Created package.json');
  }

  /**
   * Create TypeScript configuration
   */
  private createTypeScriptConfig(): void {
    const tsConfig = {
      compilerOptions: {
        target: "ES2020",
        module: "commonjs",
        lib: ["ES2020"],
        outDir: "./dist",
        rootDir: "./src",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        resolveJsonModule: true,
        allowSyntheticDefaultImports: true,
        moduleResolution: "node",
        baseUrl: "./",
        paths: {
          "@/*": ["src/*"],
          "@/app/*": ["src/app/*"],
          "@/config/*": ["src/config/*"],
          "@/database/*": ["src/database/*"]
        }
      },
      include: ["src/**/*"],
      exclude: ["node_modules", "dist"]
    };

    fs.writeFileSync(
      path.join(this.projectPath, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );
    this.info('✓ Created TypeScript configuration');
  }

  /**
   * Create environment files
   */
  private createEnvFiles(): void {
    const envContent = `# Application Configuration
APP_NAME="${this.projectName}"
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:3000
APP_TIMEZONE=UTC
PORT=3000

# Database Configuration
DB_CONNECTION=sqlite
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=database.sqlite
DB_USERNAME=root
DB_PASSWORD=

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=*

# File Uploads
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100`;

    fs.writeFileSync(path.join(this.projectPath, '.env'), envContent);
    fs.writeFileSync(path.join(this.projectPath, '.env.example'), envContent);
    this.info('✓ Created environment files');
  }

  /**
   * Create source directory structure
   */
  private createSourceStructure(): void {
    const directories = [
      'src',
      'src/app',
      'src/app/Models',
      'src/app/Middleware',
      'src/app/Http',
      'src/app/Http/Controllers',  // Laravel-style: Controllers inside Http
      'src/app/Http/Requests',
      'src/app/Http/Resources',
      'src/config',
      'src/database',
      'src/database/migrations',
      'src/database/seeders',
      'src/routes',
      'src/cli',
      'src/cli/stubs'
    ];

    directories.forEach(dir => {
      fs.mkdirSync(path.join(this.projectPath, dir), { recursive: true });
    });
    this.info('✓ Created source directory structure');
  }

  /**
   * Create basic project files
   */
  private createBasicFiles(): void {
      // Create main index.ts
      const indexContent = `import 'reflect-metadata';
import { NodeRexApplication } from 'noderex';
import { setupRoutes } from './routes/web';

// Create and start the application
const app = new NodeRexApplication();

// Setup routes
const router = app.getRouter();
setupRoutes(router);
router.registerRoutes(); // Register all routes with Express

app.start().catch(console.error);`;

      fs.writeFileSync(path.join(this.projectPath, 'src', 'index.ts'), indexContent);

    // Create basic routes
    const routesContent = `import { Router } from 'noderex';

export function setupRoutes(router: Router): void {
  // API routes
  router.group('/api', (router) => {
    router.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
      });
    });
    
    // Add your routes here
    // router.get('/users', 'UserController@index');
    // router.post('/users', 'UserController@store');
  });
}`;

    fs.writeFileSync(path.join(this.projectPath, 'src', 'routes', 'web.ts'), routesContent);

    // Create README
    const readmeContent = `# ${this.projectName}

A NodeRex application.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Copy environment file:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Available Commands

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run artisan\` - Run Artisan CLI commands

## Artisan Commands

- \`npm run artisan make:controller <name>\` - Create a new controller
- \`npm run artisan make:model <name>\` - Create a new model
- \`npm run artisan make:migration <name>\` - Create a new migration
- \`npm run artisan make:request <name>\` - Create a new request class
- \`npm run artisan make:resource <name>\` - Create a new resource class
- \`npm run artisan route:list\` - List all routes
- \`npm run artisan migrate\` - Run database migrations

## Documentation

Visit [NodeRex Documentation](https://github.com/arslanbht/noderex) for more information.`;

    fs.writeFileSync(path.join(this.projectPath, 'README.md'), readmeContent);

    // Create .gitignore
    const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# TypeScript compiled output
dist/
build/
*.js.map
*.d.ts.map

# Environment files
.env
.env.local
.env.*.local

# Database files
*.sqlite
*.sqlite3
*.db

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Coverage
coverage/

# Temporary files
tmp/
temp/
*.tmp

# Lock files (keep package-lock.json)
yarn.lock
pnpm-lock.yaml`;

    fs.writeFileSync(path.join(this.projectPath, '.gitignore'), gitignoreContent);

    this.info('✓ Created basic project files');
  }

  /**
   * Install dependencies
   */
  private installDependencies(): void {
    this.info('📦 Installing dependencies...');
    try {
      process.chdir(this.projectPath);
      execSync('npm install', { stdio: 'inherit' });
      this.info('✓ Dependencies installed');
    } catch (error) {
      this.warning('⚠️  Failed to install dependencies automatically');
      this.info('Please run "npm install" manually in the project directory');
    }
  }

  /**
   * Logging helpers
   */
  private success(message: string): void {
    console.log(chalk.green(message));
  }

  private error(message: string): void {
    console.error(chalk.red(message));
  }

  private info(message: string): void {
    console.log(chalk.blue(message));
  }

  private warning(message: string): void {
    console.log(chalk.yellow(message));
  }
}

// CLI setup
program
  .name('noderex')
  .description('Create a new NodeRex project')
  .version('1.0.0')
  .argument('<project-name>', 'Name of the project to create')
  .option('--skip-install', 'Skip npm install step')
  .action(async (projectName: string, options: any) => {
    const creator = new ProjectCreator();
    await creator.createProject(projectName, options);
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red(`Unknown command: ${program.args.join(' ')}`));
  console.error('Use "noderex --help" for available commands.');
  process.exit(1);
});

// Run the CLI
if (require.main === module) {
  program.parse();
}

export default ProjectCreator;
