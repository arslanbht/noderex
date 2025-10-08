import 'reflect-metadata';
import express from 'express';
import { Router } from './routes/Router';
/**
 * NodeRex Application Class
 */
declare class NodeRexApplication {
    private app;
    private router;
    private errorHandlingSetup;
    constructor();
    /**
     * Setup application middleware
     */
    private setupMiddleware;
    /**
     * Setup application routes
     */
    private setupRoutes;
    /**
     * Setup error handling
     */
    private setupErrorHandling;
    /**
     * Initialize database connection
     */
    private initializeDatabase;
    /**
     * Start the application server
     */
    start(): Promise<void>;
    /**
     * Get the Express application instance
     */
    getApp(): express.Application;
    /**
     * Get the router instance
     */
    getRouter(): Router;
}
export default NodeRexApplication;
export { NodeRexApplication };
export { Model } from './app/Models/Model';
export { Controller } from './app/Http/Controllers/Controller';
export { Resource } from './app/Http/Resources/Resource';
export { Request, Validation } from './app/Http/Requests/Request';
export { Migration } from './database/migrations/Migration';
export { Seeder } from './database/seeders/Seeder';
export { Router } from './routes/Router';
//# sourceMappingURL=index.d.ts.map