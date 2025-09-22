import { Request, Response, NextFunction } from 'express';
/**
 * Base Controller class for NodeRex framework
 * Provides common functionality for all controllers
 */
export declare abstract class Controller {
    protected request: Request;
    protected response: Response;
    protected next: NextFunction;
    /**
     * Set the request, response, and next function
     */
    setContext(req: Request, res: Response, next: NextFunction): void;
    /**
     * Get the request object
     */
    protected getRequest(): Request;
    /**
     * Get the response object
     */
    protected getResponse(): Response;
    /**
     * Get the next function
     */
    protected getNext(): NextFunction;
    /**
     * Get all input from request
     */
    protected all(): Record<string, any>;
    /**
     * Get input by key
     */
    protected input(key: string, defaultValue?: any): any;
    /**
     * Get only specified inputs
     */
    protected only(keys: string[]): Record<string, any>;
    /**
     * Get all inputs except specified ones
     */
    protected except(keys: string[]): Record<string, any>;
    /**
     * Validate that input exists
     */
    protected has(key: string): boolean;
    /**
     * Validate that input exists and is not empty
     */
    protected filled(key: string): boolean;
    /**
     * Send JSON response
     */
    protected json(data: any, status?: number): Response;
    /**
     * Send success response
     */
    protected success(data: any, message?: string, status?: number): Response;
    /**
     * Send error response
     */
    protected error(message?: string, status?: number, errors?: Record<string, string[]>): Response;
    /**
     * Send validation error response
     */
    protected validationError(errors: Record<string, string[]>): Response;
    /**
     * Send not found response
     */
    protected notFound(message?: string): Response;
    /**
     * Send unauthorized response
     */
    protected unauthorized(message?: string): Response;
    /**
     * Send forbidden response
     */
    protected forbidden(message?: string): Response;
    /**
     * Send created response
     */
    protected created(data: any, message?: string): Response;
    /**
     * Send no content response
     */
    protected noContent(): Response;
}
//# sourceMappingURL=Controller.d.ts.map