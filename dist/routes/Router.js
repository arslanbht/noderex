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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = exports.Router = void 0;
/**
 * Router class for NodeRex framework
 * Provides Laravel-style routing functionality
 */
class Router {
    constructor(app) {
        this.routes = [];
        this.middlewareMap = new Map();
        this.app = app;
    }
    /**
     * Register middleware
     */
    middleware(name, handler) {
        this.middlewareMap.set(name, handler);
    }
    /**
     * Get middleware by name
     */
    getMiddleware(name) {
        return this.middlewareMap.get(name);
    }
    /**
     * Define a GET route
     */
    get(path, handler, middleware = []) {
        return this.addRoute('get', path, handler, middleware);
    }
    /**
     * Define a POST route
     */
    post(path, handler, middleware = []) {
        return this.addRoute('post', path, handler, middleware);
    }
    /**
     * Define a PUT route
     */
    put(path, handler, middleware = []) {
        return this.addRoute('put', path, handler, middleware);
    }
    /**
     * Define a PATCH route
     */
    patch(path, handler, middleware = []) {
        return this.addRoute('patch', path, handler, middleware);
    }
    /**
     * Define a DELETE route
     */
    delete(path, handler, middleware = []) {
        return this.addRoute('delete', path, handler, middleware);
    }
    /**
     * Define a route that accepts any HTTP method
     */
    any(path, handler, middleware = []) {
        return this.addRoute('all', path, handler, middleware);
    }
    /**
     * Define multiple routes with the same prefix
     */
    group(prefix, callback, middleware = []) {
        const groupRouter = new Router(this.app);
        callback(groupRouter);
        // Apply prefix and middleware to all routes in the group
        groupRouter.routes.forEach(route => {
            const prefixedRoute = {
                ...route,
                path: `${prefix}${route.path}`,
                middleware: [...middleware, ...(route.middleware || [])]
            };
            this.routes.push(prefixedRoute);
        });
    }
    /**
     * Define resource routes (RESTful)
     */
    resource(name, controller, middleware = []) {
        const routes = [
            { method: 'get', path: `/${name}`, handler: `${controller}@index` },
            { method: 'get', path: `/${name}/create`, handler: `${controller}@create` },
            { method: 'post', path: `/${name}`, handler: `${controller}@store` },
            { method: 'get', path: `/${name}/:id`, handler: `${controller}@show` },
            { method: 'get', path: `/${name}/:id/edit`, handler: `${controller}@edit` },
            { method: 'put', path: `/${name}/:id`, handler: `${controller}@update` },
            { method: 'patch', path: `/${name}/:id`, handler: `${controller}@update` },
            { method: 'delete', path: `/${name}/:id`, handler: `${controller}@destroy` }
        ];
        routes.forEach(route => {
            this.addRoute(route.method, route.path, route.handler, middleware);
        });
    }
    /**
     * Define API resource routes (without create/edit views)
     */
    apiResource(name, controller, middleware = []) {
        const routes = [
            { method: 'get', path: `/${name}`, handler: `${controller}@index` },
            { method: 'post', path: `/${name}`, handler: `${controller}@store` },
            { method: 'get', path: `/${name}/:id`, handler: `${controller}@show` },
            { method: 'put', path: `/${name}/:id`, handler: `${controller}@update` },
            { method: 'patch', path: `/${name}/:id`, handler: `${controller}@update` },
            { method: 'delete', path: `/${name}/:id`, handler: `${controller}@destroy` }
        ];
        routes.forEach(route => {
            this.addRoute(route.method, route.path, route.handler, middleware);
        });
    }
    /**
     * Add a route definition
     */
    addRoute(method, path, handler, middleware = []) {
        const route = {
            method,
            path,
            handler,
            middleware
        };
        this.routes.push(route);
        return route;
    }
    /**
     * Register all routes with Express
     */
    registerRoutes() {
        console.log(`📋 Registering ${this.routes.length} routes...`);
        let successCount = 0;
        let errorCount = 0;
        this.routes.forEach((route, index) => {
            try {
                console.log(`  ${route.method.toUpperCase()} ${route.path} -> ${typeof route.handler === 'function' ? '[Function]' : route.handler}`);
                const method = route.method.toLowerCase();
                const handler = this.createHandler(route.handler);
                const middleware = this.getMiddlewareStack(route.middleware || []);
                // Validate middleware
                const invalidMiddleware = middleware.filter(mw => !mw);
                if (invalidMiddleware.length > 0) {
                    console.warn(`⚠️  Route ${route.method} ${route.path} has ${invalidMiddleware.length} invalid middleware`);
                }
                switch (method) {
                    case 'get':
                        this.app.get(route.path, ...middleware, handler);
                        break;
                    case 'post':
                        this.app.post(route.path, ...middleware, handler);
                        break;
                    case 'put':
                        this.app.put(route.path, ...middleware, handler);
                        break;
                    case 'patch':
                        this.app.patch(route.path, ...middleware, handler);
                        break;
                    case 'delete':
                        this.app.delete(route.path, ...middleware, handler);
                        break;
                    case 'all':
                        this.app.all(route.path, ...middleware, handler);
                        break;
                    default:
                        console.warn(`⚠️  Unknown HTTP method: ${method} for route ${route.path}`);
                        errorCount++;
                        return;
                }
                successCount++;
            }
            catch (error) {
                console.error(`❌ Failed to register route ${route.method} ${route.path}:`, error);
                errorCount++;
            }
        });
        if (errorCount > 0) {
            console.log(`⚠️  Routes registered with ${errorCount} errors and ${successCount} successes`);
        }
        else {
            console.log(`✅ All ${successCount} routes registered successfully`);
        }
    }
    /**
     * Get middleware stack for a route
     */
    getMiddlewareStack(middlewareNames) {
        return middlewareNames
            .map(name => this.middlewareMap.get(name))
            .filter(Boolean);
    }
    /**
     * Create Express handler from controller@method string or function
     */
    createHandler(handler) {
        // If handler is a function, return it directly
        if (typeof handler === 'function') {
            return async (req, res, next) => {
                try {
                    await handler(req, res);
                }
                catch (error) {
                    next(error);
                }
            };
        }
        // If handler is a string (controller@method), handle controller route
        return async (req, res, next) => {
            try {
                const [controllerName, methodName] = handler.split('@');
                // Import the controller dynamically
                const ControllerClass = await this.importController(controllerName);
                if (!ControllerClass) {
                    throw new Error(`Controller ${controllerName} not found`);
                }
                // Create controller instance
                const controller = new ControllerClass();
                // Set context
                if (typeof controller.setContext === 'function') {
                    controller.setContext(req, res, next);
                }
                // Call the method
                if (typeof controller[methodName] === 'function') {
                    await controller[methodName]();
                }
                else {
                    throw new Error(`Method ${methodName} not found in controller ${controllerName}`);
                }
            }
            catch (error) {
                next(error);
            }
        };
    }
    /**
     * Dynamically import controller
     */
    async importController(controllerName) {
        // Handle namespace controllers (e.g., Auth/UserController)
        const parts = controllerName.split('/');
        const fileName = parts[parts.length - 1];
        const namespace = parts.slice(0, -1);
        const path = require('path');
        try {
            // Get the current working directory (application root)
            const cwd = process.cwd();
            // Try multiple possible paths for controller location
            const possiblePaths = [
                // Current project's dist directory (compiled)
                namespace.length > 0
                    ? path.join(cwd, 'dist', 'app', 'Controllers', ...namespace, fileName)
                    : path.join(cwd, 'dist', 'app', 'Controllers', fileName),
                // Relative dist/app/Controllers
                namespace.length > 0
                    ? path.join(cwd, 'dist', 'app', 'Controllers', ...namespace, fileName)
                    : path.join(cwd, 'dist', 'app', 'Controllers', fileName),
                // Source directory (for development with ts-node)
                namespace.length > 0
                    ? path.join(cwd, 'src', 'app', 'Controllers', ...namespace, fileName)
                    : path.join(cwd, 'src', 'app', 'Controllers', fileName),
                // Relative paths (legacy support)
                namespace.length > 0
                    ? `./dist/app/Controllers/${namespace.join('/')}/${fileName}`
                    : `./dist/app/Controllers/${fileName}`,
                namespace.length > 0
                    ? `./src/app/Controllers/${namespace.join('/')}/${fileName}`
                    : `./src/app/Controllers/${fileName}`
            ];
            let module = null;
            let successfulPath = '';
            for (const controllerPath of possiblePaths) {
                try {
                    console.log(`🔍 Trying to import controller from: ${controllerPath}`);
                    module = await Promise.resolve(`${controllerPath}`).then(s => __importStar(require(s)));
                    successfulPath = controllerPath;
                    break;
                }
                catch (pathError) {
                    // Continue to next path
                    continue;
                }
            }
            if (!module) {
                throw new Error(`Controller not found in any of the expected locations`);
            }
            const ControllerClass = module[fileName] || module.default;
            if (!ControllerClass) {
                console.error(`❌ Controller class not found in module: ${controllerName}`);
                return null;
            }
            console.log(`✅ Successfully imported controller: ${controllerName} from ${successfulPath}`);
            return ControllerClass;
        }
        catch (error) {
            console.error(`❌ Failed to import controller ${controllerName}:`, error);
            return null;
        }
    }
    /**
     * Get all registered routes
     */
    getRoutes() {
        return this.routes;
    }
    /**
     * Get routes by method
     */
    getRoutesByMethod(method) {
        return this.routes.filter(route => route.method.toLowerCase() === method.toLowerCase());
    }
    /**
     * Find route by name
     */
    findRouteByName(name) {
        return this.routes.find(route => route.name === name);
    }
    /**
     * Generate URL for a named route
     */
    url(name, params = {}) {
        const route = this.findRouteByName(name);
        if (!route) {
            throw new Error(`Route ${name} not found`);
        }
        let url = route.path;
        Object.keys(params).forEach(key => {
            url = url.replace(`:${key}`, params[key]);
        });
        return url;
    }
    /**
     * Generate route name from controller and method
     */
    routeName(controller, method) {
        return `${controller.toLowerCase()}.${method}`;
    }
}
exports.Router = Router;
/**
 * Route helper functions
 */
exports.Route = {
    /**
     * Generate route name
     */
    name: (name) => ({ name }),
    /**
     * Add middleware to route
     */
    middleware: (middleware) => ({ middleware }),
    /**
     * Add prefix to route
     */
    prefix: (prefix) => ({ prefix }),
    /**
     * Add domain to route
     */
    domain: (domain) => ({ domain }),
    /**
     * Add where constraints to route
     */
    where: (constraints) => ({ where: constraints })
};
//# sourceMappingURL=Router.js.map