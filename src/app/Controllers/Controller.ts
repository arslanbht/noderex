import { Request, Response, NextFunction } from 'express';

/**
 * Base Controller class for NodeRex framework
 * Provides common functionality for all controllers
 */
export abstract class Controller {
  protected request!: Request;
  protected response!: Response;
  protected next!: NextFunction;

  /**
   * Set the request, response, and next function
   */
  public setContext(req: Request, res: Response, next: NextFunction): void {
    this.request = req;
    this.response = res;
    this.next = next;
  }

  /**
   * Get the request object
   */
  protected getRequest(): Request {
    return this.request;
  }

  /**
   * Get the response object
   */
  protected getResponse(): Response {
    return this.response;
  }

  /**
   * Get the next function
   */
  protected getNext(): NextFunction {
    return this.next;
  }

  /**
   * Get all input from request
   */
  protected all(): Record<string, any> {
    return { ...this.request.body, ...this.request.query, ...this.request.params };
  }

  /**
   * Get input by key
   */
  protected input(key: string, defaultValue: any = null): any {
    return this.request.body[key] || 
           this.request.query[key] || 
           this.request.params[key] || 
           defaultValue;
  }

  /**
   * Get only specified inputs
   */
  protected only(keys: string[]): Record<string, any> {
    const result: Record<string, any> = {};
    const allInputs = this.all();
    
    keys.forEach(key => {
      if (key in allInputs) {
        result[key] = allInputs[key];
      }
    });
    
    return result;
  }

  /**
   * Get all inputs except specified ones
   */
  protected except(keys: string[]): Record<string, any> {
    const result = this.all();
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  }

  /**
   * Validate that input exists
   */
  protected has(key: string): boolean {
    const allInputs = this.all();
    return key in allInputs && allInputs[key] !== null && allInputs[key] !== undefined;
  }

  /**
   * Validate that input exists and is not empty
   */
  protected filled(key: string): boolean {
    const value = this.input(key);
    return value !== null && value !== undefined && value !== '';
  }

  /**
   * Send JSON response
   */
  protected json(data: any, status: number = 200): Response {
    return this.response.status(status).json(data);
  }

  /**
   * Send success response
   */
  protected success(data: any, message: string = 'Success', status: number = 200): Response {
    return this.response.status(status).json({
      success: true,
      message,
      data
    });
  }

  /**
   * Send error response
   */
  protected error(message: string = 'Error', status: number = 400, errors?: Record<string, string[]>): Response {
    const response: any = {
      success: false,
      message
    };
    
    if (errors) {
      response.errors = errors;
    }
    
    return this.response.status(status).json(response);
  }

  /**
   * Send validation error response
   */
  protected validationError(errors: Record<string, string[]>): Response {
    return this.error('Validation failed', 422, errors);
  }

  /**
   * Send not found response
   */
  protected notFound(message: string = 'Not found'): Response {
    return this.error(message, 404);
  }

  /**
   * Send unauthorized response
   */
  protected unauthorized(message: string = 'Unauthorized'): Response {
    return this.error(message, 401);
  }

  /**
   * Send forbidden response
   */
  protected forbidden(message: string = 'Forbidden'): Response {
    return this.error(message, 403);
  }

  /**
   * Send created response
   */
  protected created(data: any, message: string = 'Created successfully'): Response {
    return this.success(data, message, 201);
  }

  /**
   * Send no content response
   */
  protected noContent(): Response {
    return this.response.status(204).send();
  }
}
