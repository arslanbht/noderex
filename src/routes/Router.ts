import { Application, Request, Response, NextFunction } from 'express';
import { Controller } from '../app/Http/Controllers/Controller';

/**
 * Route definition interface
 */
export interface RouteDefinition {
  method: string;
  path: string;
  handler: string | ((req: Request, res: Response) => any);
  middleware?: string[];
  name?: string;
}

/**
 * Router class for NodeRex framework
 * Provides Laravel-style routing functionality
 */
export class Router {
  private app: Application;
  private routes: RouteDefinition[] = [];
  private middlewareMap: Map<string, (req: Request, res: Response, next: NextFunction) => void> = new Map();

  constructor(app: Application) {
    this.app = app;
  }

  /**
   * Register middleware
   */
  public middleware(name: string, handler: (req: Request, res: Response, next: NextFunction) => void): void {
    this.middlewareMap.set(name, handler);
  }

  /**
   * Get middleware by name
   */
  public getMiddleware(name: string): ((req: Request, res: Response, next: NextFunction) => void) | undefined {
    return this.middlewareMap.get(name);
  }

  /**
   * Define a GET route
   */
  public get(path: string, handler: string | ((req: Request, res: Response) => any), middleware: string[] = []): RouteDefinition {
    return this.addRoute('get', path, handler, middleware);
  }

  /**
   * Define a POST route
   */
  public post(path: string, handler: string | ((req: Request, res: Response) => any), middleware: string[] = []): RouteDefinition {
    return this.addRoute('post', path, handler, middleware);
  }

  /**
   * Define a PUT route
   */
  public put(path: string, handler: string | ((req: Request, res: Response) => any), middleware: string[] = []): RouteDefinition {
    return this.addRoute('put', path, handler, middleware);
  }

  /**
   * Define a PATCH route
   */
  public patch(path: string, handler: string | ((req: Request, res: Response) => any), middleware: string[] = []): RouteDefinition {
    return this.addRoute('patch', path, handler, middleware);
  }

  /**
   * Define a DELETE route
   */
  public delete(path: string, handler: string | ((req: Request, res: Response) => any), middleware: string[] = []): RouteDefinition {
    return this.addRoute('delete', path, handler, middleware);
  }

  /**
   * Define a route that accepts any HTTP method
   */
  public any(path: string, handler: string | ((req: Request, res: Response) => any), middleware: string[] = []): RouteDefinition {
    return this.addRoute('all', path, handler, middleware);
  }

  /**
   * Define multiple routes with the same prefix
   */
  public group(prefix: string, callback: (router: Router) => void, middleware: string[] = []): void {
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
  public resource(name: string, controller: string, middleware: string[] = []): void {
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
  public apiResource(name: string, controller: string, middleware: string[] = []): void {
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
  private addRoute(method: string, path: string, handler: string | ((req: Request, res: Response) => any), middleware: string[] = []): RouteDefinition {
    const route: RouteDefinition = {
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
  public registerRoutes(): void {
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
      } catch (error) {
        console.error(`❌ Failed to register route ${route.method} ${route.path}:`, error);
        errorCount++;
      }
    });
    
    if (errorCount > 0) {
      console.log(`⚠️  Routes registered with ${errorCount} errors and ${successCount} successes`);
    } else {
      console.log(`✅ All ${successCount} routes registered successfully`);
    }
  }

  /**
   * Get middleware stack for a route
   */
  private getMiddlewareStack(middlewareNames: string[]): ((req: Request, res: Response, next: NextFunction) => void)[] {
    return middlewareNames
      .map(name => this.middlewareMap.get(name))
      .filter(Boolean) as ((req: Request, res: Response, next: NextFunction) => void)[];
  }

  /**
   * Create Express handler from controller@method string or function
   */
  private createHandler(handler: string | ((req: Request, res: Response) => any)): (req: Request, res: Response, next: NextFunction) => void {
    // If handler is a function, return it directly
    if (typeof handler === 'function') {
      return async (req: Request, res: Response, next: NextFunction) => {
        try {
          await handler(req, res);
        } catch (error) {
          next(error);
        }
      };
    }

    // If handler is a string (controller@method), handle controller route
    return async (req: Request, res: Response, next: NextFunction) => {
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
        if (typeof controller[methodName as keyof typeof controller] === 'function') {
          await (controller[methodName as keyof typeof controller] as Function)();
        } else {
          throw new Error(`Method ${methodName} not found in controller ${controllerName}`);
        }
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Dynamically import controller
   */
  private async importController(controllerName: string): Promise<any> {
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
        // Current project's dist directory (compiled) - Laravel-style structure
        namespace.length > 0 
          ? path.join(cwd, 'dist', 'app', 'Http', 'Controllers', ...namespace, fileName)
          : path.join(cwd, 'dist', 'app', 'Http', 'Controllers', fileName),
        // Source directory (for development with ts-node) - Laravel-style structure
        namespace.length > 0 
          ? path.join(cwd, 'src', 'app', 'Http', 'Controllers', ...namespace, fileName)
          : path.join(cwd, 'src', 'app', 'Http', 'Controllers', fileName),
        // Legacy support (old structure)
        namespace.length > 0 
          ? path.join(cwd, 'dist', 'app', 'Controllers', ...namespace, fileName)
          : path.join(cwd, 'dist', 'app', 'Controllers', fileName),
        namespace.length > 0 
          ? path.join(cwd, 'src', 'app', 'Controllers', ...namespace, fileName)
          : path.join(cwd, 'src', 'app', 'Controllers', fileName),
        // Relative paths (legacy support)
        namespace.length > 0 
          ? `./dist/app/Http/Controllers/${namespace.join('/')}/${fileName}`
          : `./dist/app/Http/Controllers/${fileName}`,
        namespace.length > 0 
          ? `./src/app/Http/Controllers/${namespace.join('/')}/${fileName}`
          : `./src/app/Http/Controllers/${fileName}`
      ];
      
      let module = null;
      let successfulPath = '';
      
      for (const controllerPath of possiblePaths) {
        try {
          console.log(`🔍 Trying to import controller from: ${controllerPath}`);
          module = await import(controllerPath);
          successfulPath = controllerPath;
          break;
        } catch (pathError) {
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
    } catch (error) {
      console.error(`❌ Failed to import controller ${controllerName}:`, error);
      return null;
    }
  }

  /**
   * Get all registered routes
   */
  public getRoutes(): RouteDefinition[] {
    return this.routes;
  }

  /**
   * Get routes by method
   */
  public getRoutesByMethod(method: string): RouteDefinition[] {
    return this.routes.filter(route => route.method.toLowerCase() === method.toLowerCase());
  }

  /**
   * Find route by name
   */
  public findRouteByName(name: string): RouteDefinition | undefined {
    return this.routes.find(route => route.name === name);
  }

  /**
   * Generate URL for a named route
   */
  public url(name: string, params: Record<string, any> = {}): string {
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
  public routeName(controller: string, method: string): string {
    return `${controller.toLowerCase()}.${method}`;
  }
}

/**
 * Route helper functions
 */
export const Route = {
  /**
   * Generate route name
   */
  name: (name: string) => ({ name }),
  
  /**
   * Add middleware to route
   */
  middleware: (middleware: string[]) => ({ middleware }),
  
  /**
   * Add prefix to route
   */
  prefix: (prefix: string) => ({ prefix }),
  
  /**
   * Add domain to route
   */
  domain: (domain: string) => ({ domain }),
  
  /**
   * Add where constraints to route
   */
  where: (constraints: Record<string, string>) => ({ where: constraints })
};
