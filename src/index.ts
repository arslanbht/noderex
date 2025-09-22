import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createConnection } from 'typeorm';
import { app as appConfig } from './config/app';
import { database } from './config/database';
import { Router } from './routes/Router';
import { errorHandler } from '@/app/Middleware/ErrorHandler';
import { notFoundHandler } from '@/app/Middleware/NotFoundHandler';

/**
 * NodeRex Application Class
 */
class NodeRexApplication {
  private app: express.Application;
  private router: Router;

  constructor() {
    this.app = express();
    this.router = new Router(this.app);
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
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
    // Health check route
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'NodeRex API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // API routes
    this.router.group('/api', (router) => {
      // User routes
      router.get('/users', 'UserController@index');
      router.post('/users', 'UserController@store');
      router.get('/users/:id', 'UserController@show');
      router.put('/users/:id', 'UserController@update');
      router.delete('/users/:id', 'UserController@destroy');
      
      // Post routes
      router.get('/posts', 'PostController@index');
      router.post('/posts', 'PostController@store');
      router.get('/posts/:id', 'PostController@show');
      router.put('/posts/:id', 'PostController@update');
      router.delete('/posts/:id', 'PostController@destroy');
    });

    // Register all routes
    this.router.registerRoutes();
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

// Create and start the application
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

// Start the application
if (require.main === module) {
  application.start().catch(console.error);
}

export default NodeRexApplication;
export { NodeRexApplication };
