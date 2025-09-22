import 'dotenv/config';
/**
 * Application configuration for NodeRex framework
 */
export declare const app: {
    name: string;
    env: string;
    debug: boolean;
    url: string;
    port: number;
    timezone: string;
    cors: {
        origin: string;
        methods: string[];
        allowedHeaders: string[];
        credentials: boolean;
    };
    security: {
        jwt: {
            secret: string;
            expiresIn: string;
        };
        bcrypt: {
            rounds: number;
        };
    };
    uploads: {
        maxFileSize: number;
        allowedMimeTypes: string[];
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
};
export default app;
//# sourceMappingURL=app.d.ts.map