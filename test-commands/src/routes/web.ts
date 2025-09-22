import { Router } from 'noderex';

export function setupRoutes(router: Router): void {
  // API routes
  router.group('/api', (router) => {
    router.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
      });
    });
    
    // Add your routes here
    // router.get('/users', 'UserController@index');
    // router.post('/users', 'UserController@store');
  });
}