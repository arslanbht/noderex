import 'reflect-metadata';
import { NodeRexApplication } from 'noderex';
import { setupRoutes } from './routes/web';

// Create and start the application
const app = new NodeRexApplication();

// Setup routes
const router = app.getRouter();
setupRoutes(router);
router.registerRoutes(); // Register the routes with Express

// Start on port 3001 to avoid conflicts
app.start().catch(console.error);