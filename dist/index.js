"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = exports.Seeder = exports.Migration = exports.Validation = exports.Request = exports.Resource = exports.Controller = exports.Model = exports.NodeRexApplication = void 0;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const typeorm_1 = require("typeorm");
const app_1 = require("./config/app");
const database_1 = require("./config/database");
const Router_1 = require("./routes/Router");
const ErrorHandler_1 = require("./app/Middleware/ErrorHandler");
const NotFoundHandler_1 = require("./app/Middleware/NotFoundHandler");
/**
 * NodeRex Application Class
 */
class NodeRexApplication {
    constructor() {
        this.errorHandlingSetup = false;
        this.app = (0, express_1.default)();
        this.router = new Router_1.Router(this.app);
        this.setupMiddleware();
        this.setupRoutes();
        // Note: Error handling is setup just before starting the server
        // to allow applications to register routes first
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
            // Setup error handling (must be done AFTER all routes are registered)
            if (!this.errorHandlingSetup) {
                this.setupErrorHandling();
                this.errorHandlingSetup = true;
            }
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
exports.default = NodeRexApplication;
// Export base classes for use in generated projects
var Model_1 = require("./app/Models/Model");
Object.defineProperty(exports, "Model", { enumerable: true, get: function () { return Model_1.Model; } });
var Controller_1 = require("./app/Http/Controllers/Controller");
Object.defineProperty(exports, "Controller", { enumerable: true, get: function () { return Controller_1.Controller; } });
var Resource_1 = require("./app/Http/Resources/Resource");
Object.defineProperty(exports, "Resource", { enumerable: true, get: function () { return Resource_1.Resource; } });
var Request_1 = require("./app/Http/Requests/Request");
Object.defineProperty(exports, "Request", { enumerable: true, get: function () { return Request_1.Request; } });
Object.defineProperty(exports, "Validation", { enumerable: true, get: function () { return Request_1.Validation; } });
var Migration_1 = require("./database/migrations/Migration");
Object.defineProperty(exports, "Migration", { enumerable: true, get: function () { return Migration_1.Migration; } });
var Seeder_1 = require("./database/seeders/Seeder");
Object.defineProperty(exports, "Seeder", { enumerable: true, get: function () { return Seeder_1.Seeder; } });
var Router_2 = require("./routes/Router");
Object.defineProperty(exports, "Router", { enumerable: true, get: function () { return Router_2.Router; } });
//# sourceMappingURL=index.js.map