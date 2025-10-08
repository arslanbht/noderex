import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createConnection } from 'typeorm';
import { app as appConfig } from './config/app';
import { database } from './config/database';
import { Router } from './routes/Router';
import { errorHandler } from './app/Middleware/ErrorHandler';
import { notFoundHandler } from './app/Middleware/NotFoundHandler';

/**
 * NodeRex Application Class
 */
class NodeRexApplication {
  private app: express.Application;
  private router: Router;
  private errorHandlingSetup: boolean = false;

  constructor() {
    this.app = express();
    this.router = new Router(this.app);
    this.setupMiddleware();
    this.setupRoutes();
    // Note: Error handling is setup just before starting the server
    // to allow applications to register routes first
  }

  /**
   * Setup application middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS middleware
    this.app.use(cors(appConfig.cors));
    
    // Rate limiting
    this.app.use(rateLimit({
      windowMs: appConfig.rateLimit.windowMs,
      max: appConfig.rateLimit.max,
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
      }
    }));
    
    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Request logging middleware
    this.app.use((req, res, next) => {
      if (appConfig.debug) {
        console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
      }
      next();
    });
  }

  /**
   * Setup application routes
   */
  private setupRoutes(): void {
    // Health check route - only route in the framework
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'NodeRex Framework is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        framework: 'NodeRex'
      });
    });

    // Note: Application routes should be defined in the application project
    // by importing NodeRexApplication and calling getRouter() to add routes
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  /**
   * Initialize database connection
   */
  private async initializeDatabase(): Promise<void> {
    try {
      const connectionName = database.default;
      const connectionConfig = database.connections[connectionName as keyof typeof database.connections];
      
      if (!connectionConfig) {
        throw new Error(`Database connection '${connectionName}' not found`);
      }

      await createConnection(connectionConfig);

      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      console.log('ℹ️  Continuing without database connection...');
      // Don't exit in development mode, allow app to run without DB
    }
  }

  /**
   * Start the application server
   */
  public async start(): Promise<void> {
    try {
      // Setup error handling (must be done AFTER all routes are registered)
      if (!this.errorHandlingSetup) {
        this.setupErrorHandling();
        this.errorHandlingSetup = true;
      }

      // Initialize database
      await this.initializeDatabase();
      
      // Start server
      this.app.listen(appConfig.port, () => {
        console.log(`🚀 ${appConfig.name} server is running on port ${appConfig.port}`);
        console.log(`📍 Environment: ${appConfig.env}`);
        console.log(`🔗 URL: ${appConfig.url}`);
        console.log(`🐛 Debug: ${appConfig.debug ? 'Enabled' : 'Disabled'}`);
      });
    } catch (error) {
      console.error('❌ Failed to start application:', error);
      process.exit(1);
    }
  }

  /**
   * Get the Express application instance
   */
  public getApp(): express.Application {
    return this.app;
  }

  /**
   * Get the router instance
   */
  public getRouter(): Router {
    return this.router;
  }
}

// Only start the application if this file is run directly
// This allows the framework to be imported without auto-starting
if (require.main === module) {
  console.log('⚠️  Running framework directly. Usually you would create an application that uses this framework.');
  console.log('ℹ️  Starting framework in standalone mode for testing...\n');
  
  const application = new NodeRexApplication();
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
  });

  application.start().catch(console.error);
}

// Export the main application class
export default NodeRexApplication;
export { NodeRexApplication };

// Export base classes for use in generated projects
export { Model } from './app/Models/Model';
export { Controller } from './app/Http/Controllers/Controller';
export { Resource } from './app/Http/Resources/Resource';
export { Request, Validation } from './app/Http/Requests/Request';
export { Migration } from './database/migrations/Migration';
export { Seeder } from './database/seeders/Seeder';
export { Router } from './routes/Router';
