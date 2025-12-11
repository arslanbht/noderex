import { Request as ExpressRequest, Response, NextFunction } from 'express';

/**
 * Base Request class for NodeRex framework
 * Provides Laravel-style validation functionality for incoming requests
 */
export abstract class Request {
  protected data: Record<string, any> = {};

  /**
   * Define validation rules for the request
   */
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
   * Set the request data
   */
  public setData(data: Record<string, any>): void {
    this.data = data;
  }

  /**
   * Get all request data
   */
  public all(): Record<string, any> {
    return { ...this.data };
  }

  /**
   * Get a specific field value
   */
  public get(key: string, defaultValue: any = null): any {
    return this.data[key] ?? defaultValue;
  }

  /**
   * Get only the fields that have validation rules (validated data)
   * This is Laravel's validated() method equivalent
   */
  public validated(): Record<string, any> {
    const rules = this.rules();
    const validated: Record<string, any> = {};
    
    Object.keys(rules).forEach(key => {
      if (key in this.data) {
        validated[key] = this.data[key];
      }
    });
    
    return validated;
  }

  /**
   * Validate the request data and return validated data
   * Throws ValidationException if validation fails
   * Returns only validated fields (like Laravel's validated() method)
   */
  public async validate(): Promise<Record<string, any>> {
    const rules = this.rules();
    const errors: Record<string, string[]> = {};
    const customMessages = this.messages();
    const attributes = this.attributes();

    // Validate each field
    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = this.data[field];
      const fieldErrors: string[] = [];

      // Handle array of rules
      const rulesArray = Array.isArray(fieldRules) ? fieldRules : [fieldRules];

      for (const rule of rulesArray) {
        const error = await this.validateRule(field, value, rule, this.data, customMessages, attributes);
        if (error) {
          fieldErrors.push(error);
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationException(errors);
    }

    // Return only validated fields
    return this.validated();
  }

  /**
   * Validate a single rule
   */
  private async validateRule(
    field: string,
    value: any,
    rule: any,
    allData: Record<string, any>,
    customMessages: Record<string, string>,
    attributes: Record<string, string>
  ): Promise<string | null> {
    const fieldName = attributes[field] || field;
    const ruleType = Object.keys(rule)[0];
    const ruleValue = rule[ruleType];
    const customMessage = customMessages[`${field}.${ruleType}`] || customMessages[field];

    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      return customMessage || rule.message || `The ${fieldName} field is required.`;
    }

    // Skip other validations if field is empty and not required
    if ((value === undefined || value === null || value === '') && !rule.required) {
      return null;
    }

    // Email validation
    if (rule.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        return customMessage || rule.message || `The ${fieldName} must be a valid email address.`;
      }
    }

    // Min length validation
    if (rule.minLength !== undefined) {
      if (String(value).length < rule.minLength) {
        return customMessage || rule.message || `The ${fieldName} must be at least ${rule.minLength} characters.`;
      }
    }

    // Max length validation
    if (rule.maxLength !== undefined) {
      if (String(value).length > rule.maxLength) {
        return customMessage || rule.message || `The ${fieldName} may not be greater than ${rule.maxLength} characters.`;
      }
    }

    // Min value validation
    if (rule.min !== undefined) {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < rule.min) {
        return customMessage || rule.message || `The ${fieldName} must be at least ${rule.min}.`;
      }
    }

    // Max value validation
    if (rule.max !== undefined) {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue > rule.max) {
        return customMessage || rule.message || `The ${fieldName} may not be greater than ${rule.max}.`;
      }
    }

    // Numeric validation
    if (rule.numeric) {
      if (isNaN(Number(value))) {
        return customMessage || rule.message || `The ${fieldName} must be a number.`;
      }
    }

    // Alpha validation (letters only)
    if (rule.alpha) {
      if (!/^[a-zA-Z]+$/.test(String(value))) {
        return customMessage || rule.message || `The ${fieldName} may only contain letters.`;
      }
    }

    // Alpha numeric validation
    if (rule.alphaNumeric) {
      if (!/^[a-zA-Z0-9]+$/.test(String(value))) {
        return customMessage || rule.message || `The ${fieldName} may only contain letters and numbers.`;
      }
    }

    // URL validation
    if (rule.url) {
      try {
        new URL(String(value));
      } catch {
        return customMessage || rule.message || `The ${fieldName} must be a valid URL.`;
      }
    }

    // UUID validation
    if (rule.uuid) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(String(value))) {
        return customMessage || rule.message || `The ${fieldName} must be a valid UUID.`;
      }
    }

    // Date validation
    if (rule.date) {
      const date = new Date(String(value));
      if (isNaN(date.getTime())) {
        return customMessage || rule.message || `The ${fieldName} must be a valid date.`;
      }
    }

    // Boolean validation
    if (rule.boolean) {
      if (value !== true && value !== false && value !== 'true' && value !== 'false' && value !== '1' && value !== '0') {
        return customMessage || rule.message || `The ${fieldName} must be true or false.`;
      }
    }

    // Array validation
    if (rule.array) {
      if (!Array.isArray(value)) {
        return customMessage || rule.message || `The ${fieldName} must be an array.`;
      }
    }

    // Object validation
    if (rule.object) {
      if (typeof value !== 'object' || Array.isArray(value) || value === null) {
        return customMessage || rule.message || `The ${fieldName} must be an object.`;
      }
    }

    // Confirmed validation (check for field_confirmation)
    if (rule.confirmed) {
      const confirmationField = `${field}_confirmation`;
      if (allData[confirmationField] !== value) {
        return customMessage || rule.message || `The ${fieldName} confirmation does not match.`;
      }
    }

    // Different validation (value must be different from another field)
    if (rule.different) {
      if (allData[rule.different] === value) {
        return customMessage || rule.message || `The ${fieldName} and ${attributes[rule.different] || rule.different} must be different.`;
      }
    }

    // Same validation (value must be same as another field)
    if (rule.same) {
      if (allData[rule.same] !== value) {
        return customMessage || rule.message || `The ${fieldName} and ${attributes[rule.same] || rule.same} must match.`;
      }
    }

    // In validation (value must be in array)
    if (rule.in) {
      if (!Array.isArray(rule.in) || !rule.in.includes(value)) {
        return customMessage || rule.message || `The selected ${fieldName} is invalid.`;
      }
    }

    // Not in validation (value must not be in array)
    if (rule.notIn) {
      if (Array.isArray(rule.notIn) && rule.notIn.includes(value)) {
        return customMessage || rule.message || `The selected ${fieldName} is invalid.`;
      }
    }

    // Regex validation
    if (rule.regex) {
      if (!rule.regex.test(String(value))) {
        return customMessage || rule.message || `The ${fieldName} format is invalid.`;
      }
    }

    // Unique validation (database check)
    if (rule.unique) {
      // This would require database connection - for now, skip
      // In a full implementation, you'd check the database here
    }

    // Exists validation (database check)
    if (rule.exists) {
      // This would require database connection - for now, skip
      // In a full implementation, you'd check the database here
    }

    return null;
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
 * Middleware function to validate requests (Laravel-style)
 * Validates the request and replaces req.body with validated data
 */
export function validateRequest<T extends Request>(RequestClass: new () => T) {
  return async (req: ExpressRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Create request instance
      const request = new RequestClass();
      
      // Set the request data (merge body, query, and params)
      request.setData({ ...req.body, ...req.query, ...req.params });
      
      // Validate and get validated data
      const validatedData = await request.validate();
      
      // Replace req.body with validated data (only fields that have rules)
      req.body = validatedData;
      
      // Also attach the request instance for advanced usage
      (req as any).validated = validatedData;
      (req as any).request = request;
      
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
