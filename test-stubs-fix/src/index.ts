import 'reflect-metadata';
import { NodeRexApplication } from 'noderex';
import { setupRoutes } from './routes/web';

// Create and start the application
const app = new NodeRexApplication();

// Setup routes
setupRoutes(app.getRouter());

app.start().catch(console.error);