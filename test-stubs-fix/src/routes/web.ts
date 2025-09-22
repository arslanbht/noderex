import { Router } from 'noderex';

export function setupRoutes(router: Router): void {
  // Simple test route
  router.get('/test', 'TestController@index');
  router.get('/test2', 'UserController@index');
  // API routes
  router.group('/api', (apiRouter) => {
    // Health check route
    apiRouter.get('/health', 'HealthController@index');
    
    // Add your routes here
    // apiRouter.get('/users', 'UserController@index');
    // apiRouter.post('/users', 'UserController@store');
    // apiRouter.get('/auth/users', 'Auth/UserController@index');
  });
}