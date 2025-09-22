import { Application, Request, Response, NextFunction } from 'express';
/**
 * Route definition interface
 */
export interface RouteDefinition {
    method: string;
    path: string;
    handler: string;
    middleware?: string[];
    name?: string;
}
/**
 * Router class for NodeRex framework
 * Provides Laravel-style routing functionality
 */
export declare class Router {
    private app;
    private routes;
    private middlewareMap;
    constructor(app: Application);
    /**
     * Register middleware
     */
    middleware(name: string, handler: (req: Request, res: Response, next: NextFunction) => void): void;
    /**
     * Get middleware by name
     */
    getMiddleware(name: string): ((req: Request, res: Response, next: NextFunction) => void) | undefined;
    /**
     * Define a GET route
     */
    get(path: string, handler: string, middleware?: string[]): RouteDefinition;
    /**
     * Define a POST route
     */
    post(path: string, handler: string, middleware?: string[]): RouteDefinition;
    /**
     * Define a PUT route
     */
    put(path: string, handler: string, middleware?: string[]): RouteDefinition;
    /**
     * Define a PATCH route
     */
    patch(path: string, handler: string, middleware?: string[]): RouteDefinition;
    /**
     * Define a DELETE route
     */
    delete(path: string, handler: string, middleware?: string[]): RouteDefinition;
    /**
     * Define a route that accepts any HTTP method
     */
    any(path: string, handler: string, middleware?: string[]): RouteDefinition;
    /**
     * Define multiple routes with the same prefix
     */
    group(prefix: string, callback: (router: Router) => void, middleware?: string[]): void;
    /**
     * Define resource routes (RESTful)
     */
    resource(name: string, controller: string, middleware?: string[]): void;
    /**
     * Define API resource routes (without create/edit views)
     */
    apiResource(name: string, controller: string, middleware?: string[]): void;
    /**
     * Add a route definition
     */
    private addRoute;
    /**
     * Register all routes with Express
     */
    registerRoutes(): void;
    /**
     * Get middleware stack for a route
     */
    private getMiddlewareStack;
    /**
     * Create Express handler from controller@method string
     */
    private createHandler;
    /**
     * Dynamically import controller
     */
    private importController;
    /**
     * Get all registered routes
     */
    getRoutes(): RouteDefinition[];
    /**
     * Get routes by method
     */
    getRoutesByMethod(method: string): RouteDefinition[];
    /**
     * Find route by name
     */
    findRouteByName(name: string): RouteDefinition | undefined;
    /**
     * Generate URL for a named route
     */
    url(name: string, params?: Record<string, any>): string;
    /**
     * Generate route name from controller and method
     */
    routeName(controller: string, method: string): string;
}
/**
 * Route helper functions
 */
export declare const Route: {
    /**
     * Generate route name
     */
    name: (name: string) => {
        name: string;
    };
    /**
     * Add middleware to route
     */
    middleware: (middleware: string[]) => {
        middleware: string[];
    };
    /**
     * Add prefix to route
     */
    prefix: (prefix: string) => {
        prefix: string;
    };
    /**
     * Add domain to route
     */
    domain: (domain: string) => {
        domain: string;
    };
    /**
     * Add where constraints to route
     */
    where: (constraints: Record<string, string>) => {
        where: Record<string, string>;
    };
};
//# sourceMappingURL=Router.d.ts.map