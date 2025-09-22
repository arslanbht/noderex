import 'reflect-metadata';
import { NodeRexApplication } from 'noderex';
import { setupRoutes } from './routes/web';

// Create and start the application
const app = new NodeRexApplication();

// Setup routes
const router = app.getRouter();
console.log('Before setupRoutes - Routes count:', router.getRoutes().length);
setupRoutes(router);
console.log('After setupRoutes - Routes count:', router.getRoutes().length);
router.registerRoutes(); // Register the routes with Express
console.log('After registerRoutes - Routes count:', router.getRoutes().length);

app.start().catch(console.error);