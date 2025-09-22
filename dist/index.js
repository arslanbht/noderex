"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeRexApplication = void 0;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const typeorm_1 = require("typeorm");
const app_1 = require("./config/app");
const database_1 = require("./config/database");
const Router_1 = require("./routes/Router");
const ErrorHandler_1 = require("@/app/Middleware/ErrorHandler");
const NotFoundHandler_1 = require("@/app/Middleware/NotFoundHandler");
/**
 * NodeRex Application Class
 */
class NodeRexApplication {
    constructor() {
        this.app = (0, express_1.default)();
        this.router = new Router_1.Router(this.app);
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    /**
     * Setup application middleware
     */
    setupMiddleware() {
        // Security middleware
        this.app.use((0, helmet_1.default)());
        // CORS middleware
        this.app.use((0, cors_1.default)(app_1.app.cors));
        // Rate limiting
        this.app.use((0, express_rate_limit_1.default)({
            windowMs: app_1.app.rateLimit.windowMs,
            max: app_1.app.rateLimit.max,
            message: {
                success: false,
                message: 'Too many requests from this IP, please try again later.'
            }
        }));
        // Body parsing middleware
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        // Request logging middleware
        this.app.use((req, res, next) => {
            if (app_1.app.debug) {
                console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
            }
            next();
        });
    }
    /**
     * Setup application routes
     */
    setupRoutes() {
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
    setupErrorHandling() {
        // 404 handler
        this.app.use(NotFoundHandler_1.notFoundHandler);
        // Global error handler
        this.app.use(ErrorHandler_1.errorHandler);
    }
    /**
     * Initialize database connection
     */
    async initializeDatabase() {
        try {
            const connectionName = database_1.database.default;
            const connectionConfig = database_1.database.connections[connectionName];
            if (!connectionConfig) {
                throw new Error(`Database connection '${connectionName}' not found`);
            }
            await (0, typeorm_1.createConnection)(connectionConfig);
            console.log('✅ Database connected successfully');
        }
        catch (error) {
            console.error('❌ Database connection failed:', error);
            console.log('ℹ️  Continuing without database connection...');
            // Don't exit in development mode, allow app to run without DB
        }
    }
    /**
     * Start the application server
     */
    async start() {
        try {
            // Initialize database
            await this.initializeDatabase();
            // Start server
            this.app.listen(app_1.app.port, () => {
                console.log(`🚀 ${app_1.app.name} server is running on port ${app_1.app.port}`);
                console.log(`📍 Environment: ${app_1.app.env}`);
                console.log(`🔗 URL: ${app_1.app.url}`);
                console.log(`🐛 Debug: ${app_1.app.debug ? 'Enabled' : 'Disabled'}`);
            });
        }
        catch (error) {
            console.error('❌ Failed to start application:', error);
            process.exit(1);
        }
    }
    /**
     * Get the Express application instance
     */
    getApp() {
        return this.app;
    }
    /**
     * Get the router instance
     */
    getRouter() {
        return this.router;
    }
}
exports.NodeRexApplication = NodeRexApplication;
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
exports.default = NodeRexApplication;
//# sourceMappingURL=index.js.map