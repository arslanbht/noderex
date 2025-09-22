import { Request, Response, NextFunction } from 'express';

/**
 * AuthMiddleware Middleware
 */
export class AuthMiddleware {
    /**
     * Handle the middleware
     */
    public static handle(req: Request, res: Response, next: NextFunction): void {
        // Add your middleware logic here
        // Example:
        // console.log('AuthMiddleware middleware executed');
        next();
    }
}
