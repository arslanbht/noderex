import 'reflect-metadata';
import express from 'express';
import { Router } from './routes/Router';
/**
 * NodeRex Application Class
 */
declare class NodeRexApplication {
    private app;
    private router;
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
//# sourceMappingURL=index.d.ts.map