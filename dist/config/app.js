"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("dotenv/config");
/**
 * Application configuration for NodeRex framework
 */
exports.app = {
    name: process.env.APP_NAME || 'NodeRex',
    env: process.env.NODE_ENV || 'development',
    debug: process.env.APP_DEBUG === 'true' || process.env.NODE_ENV === 'development',
    url: process.env.APP_URL || 'http://localhost:3000',
    port: parseInt(process.env.PORT || '3000'),
    timezone: process.env.APP_TIMEZONE || 'UTC',
    // CORS configuration
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true
    },
    // Security
    security: {
        jwt: {
            secret: process.env.JWT_SECRET || 'your-secret-key',
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        },
        bcrypt: {
            rounds: parseInt(process.env.BCRYPT_ROUNDS || '12')
        }
    },
    // File uploads
    uploads: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
        allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/plain'
        ]
    },
    // Rate limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX || '100') // limit each IP to 100 requests per windowMs
    }
};
exports.default = exports.app;
//# sourceMappingURL=app.js.map