import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass, Transform } from 'class-transformer';

/**
 * Base Request class for NodeRex framework
 * Provides validation functionality for incoming requests
 */
export abstract class Request {
  public abstract rules(): Record<string, any>;

  /**
   * Custom validation messages
   */
  public messages(): Record<string, string> {
    return {};
  }

  /**
   * Custom attribute names for validation messages
   */
  public attributes(): Record<string, string> {
    return {};
  }

  /**
   * Validate the request data
   */
  public async validate(): Promise<boolean> {
    const validationErrors: ValidationError[] = await validate(this);
    
    if (validationErrors.length > 0) {
      const errors: Record<string, string[]> = {};
      
      validationErrors.forEach(error => {
        if (error.constraints) {
          errors[error.property] = Object.values(error.constraints);
        }
      });
      
      throw new ValidationException(errors);
    }
    
    return true;
  }

  /**
   * Get validation rules for a specific field
   */
  public getRule(field: string): any {
    const rules = this.rules();
    return rules[field];
  }

  /**
   * Check if a field has validation rules
   */
  public hasRule(field: string): boolean {
    return field in this.rules();
  }
}

/**
 * Validation Exception class
 */
export class ValidationException extends Error {
  public errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>) {
    super('Validation failed');
    this.errors = errors;
    this.name = 'ValidationException';
  }

  /**
   * Get formatted errors for API response
   */
  public getFormattedErrors(): Record<string, string[]> {
    return this.errors;
  }
}

/**
 * Middleware function to validate requests
 */
export function validateRequest<T extends Request>(RequestClass: new () => T) {
  return async (req: ExpressRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Transform plain object to class instance
      const request = plainToClass(RequestClass, req.body);
      
      // Validate the request
      await request.validate();
      
      // Attach validated data to request object
      req.body = request;
      
      next();
    } catch (error) {
      if (error instanceof ValidationException) {
        res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: error.getFormattedErrors()
        });
        return;
      }
      
      next(error);
    }
  };
}

/**
 * Common validation decorators
 */
export function Required(message?: string) {
  return function (target: any, propertyKey: string) {
    // This would be implemented with class-validator decorators
    // For now, we'll use the rules() method approach
  };
}

export function Email(message?: string) {
  return function (target: any, propertyKey: string) {
    // This would be implemented with class-validator decorators
  };
}

export function MinLength(length: number, message?: string) {
  return function (target: any, propertyKey: string) {
    // This would be implemented with class-validator decorators
  };
}

export function MaxLength(length: number, message?: string) {
  return function (target: any, propertyKey: string) {
    // This would be implemented with class-validator decorators
  };
}

export function Unique(table: string, column: string, message?: string) {
  return function (target: any, propertyKey: string) {
    // This would be implemented with custom validation
  };
}

export function Exists(table: string, column: string, message?: string) {
  return function (target: any, propertyKey: string) {
    // This would be implemented with custom validation
  };
}

/**
 * Helper function to create validation rules
 */
export const Validation = {
  required: (message?: string) => ({ required: true, message }),
  email: (message?: string) => ({ email: true, message }),
  min: (length: number, message?: string) => ({ minLength: length, message }),
  max: (length: number, message?: string) => ({ maxLength: length, message }),
  minValue: (value: number, message?: string) => ({ min: value, message }),
  maxValue: (value: number, message?: string) => ({ max: value, message }),
  numeric: (message?: string) => ({ numeric: true, message }),
  alpha: (message?: string) => ({ alpha: true, message }),
  alphaNumeric: (message?: string) => ({ alphaNumeric: true, message }),
  url: (message?: string) => ({ url: true, message }),
  uuid: (message?: string) => ({ uuid: true, message }),
  date: (message?: string) => ({ date: true, message }),
  boolean: (message?: string) => ({ boolean: true, message }),
  array: (message?: string) => ({ array: true, message }),
  object: (message?: string) => ({ object: true, message }),
  confirmed: (message?: string) => ({ confirmed: true, message }),
  different: (field: string, message?: string) => ({ different: field, message }),
  same: (field: string, message?: string) => ({ same: field, message }),
  unique: (table: string, column: string, message?: string) => ({ unique: `${table}.${column}`, message }),
  exists: (table: string, column: string, message?: string) => ({ exists: `${table}.${column}`, message }),
  in: (values: any[], message?: string) => ({ in: values, message }),
  notIn: (values: any[], message?: string) => ({ notIn: values, message }),
  regex: (pattern: RegExp, message?: string) => ({ regex: pattern, message })
};
