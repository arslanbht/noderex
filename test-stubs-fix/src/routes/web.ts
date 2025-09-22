import { Router } from 'noderex';

export function setupRoutes(router: Router): void {
  // Laravel-style callback routes
  router.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Welcome to NodeRex!',
      timestamp: new Date().toISOString()
    });
  });

  router.get('/hello', (req, res) => {
    res.json({
      success: true,
      message: 'Hello World from NodeRex!',
      timestamp: new Date().toISOString()
    });
  });

  // Controller routes
  router.get('/test', 'TestController@index');
  router.get('/test2', 'Auth/UserController@index');
  
  // API routes
  router.group('/api', (apiRouter) => {
    // Health check route
    apiRouter.get('/health', 'HealthController@index');
    
    // API callback routes
    apiRouter.get('/status', (req, res) => {
      res.json({
        success: true,
        message: 'API is running perfectly!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    });
    
    // Add your routes here
    // apiRouter.get('/users', 'UserController@index');
    // apiRouter.post('/users', 'UserController@store');
    // apiRouter.get('/auth/users', 'Auth/UserController@index');
  });
}