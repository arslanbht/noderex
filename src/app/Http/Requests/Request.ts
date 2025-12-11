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

    // Nullable validation - allow null values
    const isNullable = rule.nullable === true;
    if (isNullable && value === null) {
      return null; // Null is allowed, skip other validations
    }

    // Sometimes validation - only validate if field is present
    if (rule.sometimes === true && (value === undefined || value === null || value === '')) {
      return null; // Field not present, skip validation
    }

    // SometimesOr validation - validate if field is present OR if other conditions are met
    if (rule.sometimesOr === true) {
      const shouldValidate = value !== undefined && value !== null && value !== '';
      if (!shouldValidate) {
        // Check if any of the alternative rules require validation
        const hasRequiredRule = rule.rules?.some((r: any) => r.required);
        if (!hasRequiredRule) {
          return null; // Skip validation if field not present and no required rule
        }
      }
    }

    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      return customMessage || rule.message || `The ${fieldName} field is required.`;
    }

    // RequiredIf validation
    if (rule.requiredIf) {
      const { field: otherField, value: otherValue } = rule.requiredIf;
      if (allData[otherField] === otherValue && (value === undefined || value === null || value === '')) {
        return customMessage || rule.message || `The ${fieldName} field is required when ${attributes[otherField] || otherField} is ${otherValue}.`;
      }
    }

    // RequiredUnless validation
    if (rule.requiredUnless) {
      const { field: otherField, value: otherValue } = rule.requiredUnless;
      if (allData[otherField] !== otherValue && (value === undefined || value === null || value === '')) {
        return customMessage || rule.message || `The ${fieldName} field is required unless ${attributes[otherField] || otherField} is ${otherValue}.`;
      }
    }

    // RequiredWith validation
    if (rule.requiredWith) {
      const hasAnyField = rule.requiredWith.some((f: string) => allData[f] !== undefined && allData[f] !== null && allData[f] !== '');
      if (hasAnyField && (value === undefined || value === null || value === '')) {
        return customMessage || rule.message || `The ${fieldName} field is required when ${rule.requiredWith.join(' or ')} is present.`;
      }
    }

    // RequiredWithAll validation
    if (rule.requiredWithAll) {
      const hasAllFields = rule.requiredWithAll.every((f: string) => allData[f] !== undefined && allData[f] !== null && allData[f] !== '');
      if (hasAllFields && (value === undefined || value === null || value === '')) {
        return customMessage || rule.message || `The ${fieldName} field is required when ${rule.requiredWithAll.join(' and ')} are present.`;
      }
    }

    // RequiredWithout validation
    if (rule.requiredWithout) {
      const hasAnyField = rule.requiredWithout.some((f: string) => allData[f] !== undefined && allData[f] !== null && allData[f] !== '');
      if (!hasAnyField && (value === undefined || value === null || value === '')) {
        return customMessage || rule.message || `The ${fieldName} field is required when ${rule.requiredWithout.join(' or ')} is not present.`;
      }
    }

    // RequiredWithoutAll validation
    if (rule.requiredWithoutAll) {
      const hasAnyField = rule.requiredWithoutAll.some((f: string) => allData[f] !== undefined && allData[f] !== null && allData[f] !== '');
      if (!hasAnyField && (value === undefined || value === null || value === '')) {
        return customMessage || rule.message || `The ${fieldName} field is required when none of ${rule.requiredWithoutAll.join(' or ')} are present.`;
      }
    }

    // Present validation - field must be present (can be null/empty)
    if (rule.present && value === undefined) {
      return customMessage || rule.message || `The ${fieldName} field must be present.`;
    }

    // Filled validation - field must be present and not empty
    if (rule.filled && (value === undefined || value === null || value === '')) {
      return customMessage || rule.message || `The ${fieldName} field must have a value.`;
    }

    // Accepted validation (must be 'yes', 'on', '1', 'true', 1, true)
    if (rule.accepted) {
      const acceptedValues = ['yes', 'on', '1', 'true', 1, true];
      if (!acceptedValues.includes(value)) {
        return customMessage || rule.message || `The ${fieldName} must be accepted.`;
      }
    }

    // Skip other validations if field is empty and not required
    if ((value === undefined || value === null || value === '') && !rule.required && !isNullable) {
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

    // Integer validation
    if (rule.integer) {
      const numValue = Number(value);
      if (isNaN(numValue) || !Number.isInteger(numValue)) {
        return customMessage || rule.message || `The ${fieldName} must be an integer.`;
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

    // Alpha dash validation (letters, numbers, dashes, underscores)
    if (rule.alphaDash) {
      if (!/^[a-zA-Z0-9_-]+$/.test(String(value))) {
        return customMessage || rule.message || `The ${fieldName} may only contain letters, numbers, dashes and underscores.`;
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

    // Date format validation
    if (rule.dateFormat) {
      // Simple date format validation - can be enhanced
      const date = new Date(String(value));
      if (isNaN(date.getTime())) {
        return customMessage || rule.message || `The ${fieldName} must be a valid date in format ${rule.dateFormat}.`;
      }
    }

    // Before date validation
    if (rule.before) {
      const valueDate = new Date(String(value));
      const beforeDate = rule.before instanceof Date ? rule.before : new Date(String(rule.before));
      if (isNaN(valueDate.getTime()) || valueDate >= beforeDate) {
        return customMessage || rule.message || `The ${fieldName} must be a date before ${beforeDate.toISOString()}.`;
      }
    }

    // After date validation
    if (rule.after) {
      const valueDate = new Date(String(value));
      const afterDate = rule.after instanceof Date ? rule.after : new Date(String(rule.after));
      if (isNaN(valueDate.getTime()) || valueDate <= afterDate) {
        return customMessage || rule.message || `The ${fieldName} must be a date after ${afterDate.toISOString()}.`;
      }
    }

    // Before or equal date validation
    if (rule.beforeOrEqual) {
      const valueDate = new Date(String(value));
      const beforeDate = rule.beforeOrEqual instanceof Date ? rule.beforeOrEqual : new Date(String(rule.beforeOrEqual));
      if (isNaN(valueDate.getTime()) || valueDate > beforeDate) {
        return customMessage || rule.message || `The ${fieldName} must be a date before or equal to ${beforeDate.toISOString()}.`;
      }
    }

    // After or equal date validation
    if (rule.afterOrEqual) {
      const valueDate = new Date(String(value));
      const afterDate = rule.afterOrEqual instanceof Date ? rule.afterOrEqual : new Date(String(rule.afterOrEqual));
      if (isNaN(valueDate.getTime()) || valueDate < afterDate) {
        return customMessage || rule.message || `The ${fieldName} must be a date after or equal to ${afterDate.toISOString()}.`;
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

    // Size validation (exact length for strings, exact count for arrays)
    if (rule.size !== undefined) {
      if (Array.isArray(value)) {
        if (value.length !== rule.size) {
          return customMessage || rule.message || `The ${fieldName} must contain exactly ${rule.size} items.`;
        }
      } else {
        if (String(value).length !== rule.size) {
          return customMessage || rule.message || `The ${fieldName} must be exactly ${rule.size} characters.`;
        }
      }
    }

    // Between validation
    if (rule.between) {
      const { min, max } = rule.between;
      if (Array.isArray(value)) {
        if (value.length < min || value.length > max) {
          return customMessage || rule.message || `The ${fieldName} must have between ${min} and ${max} items.`;
        }
      } else {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue < min || numValue > max) {
          return customMessage || rule.message || `The ${fieldName} must be between ${min} and ${max}.`;
        }
      }
    }

    // Starts with validation
    if (rule.startsWith) {
      if (!String(value).startsWith(rule.startsWith)) {
        return customMessage || rule.message || `The ${fieldName} must start with ${rule.startsWith}.`;
      }
    }

    // Ends with validation
    if (rule.endsWith) {
      if (!String(value).endsWith(rule.endsWith)) {
        return customMessage || rule.message || `The ${fieldName} must end with ${rule.endsWith}.`;
      }
    }

    // Contains validation
    if (rule.contains) {
      if (!String(value).includes(rule.contains)) {
        return customMessage || rule.message || `The ${fieldName} must contain ${rule.contains}.`;
      }
    }

    // IP validation
    if (rule.ip) {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
      if (!ipRegex.test(String(value))) {
        return customMessage || rule.message || `The ${fieldName} must be a valid IP address.`;
      }
    }

    // IPv4 validation
    if (rule.ipv4) {
      const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipv4Regex.test(String(value))) {
        return customMessage || rule.message || `The ${fieldName} must be a valid IPv4 address.`;
      }
    }

    // IPv6 validation
    if (rule.ipv6) {
      const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
      if (!ipv6Regex.test(String(value))) {
        return customMessage || rule.message || `The ${fieldName} must be a valid IPv6 address.`;
      }
    }

    // JSON validation
    if (rule.json) {
      try {
        JSON.parse(String(value));
      } catch {
        return customMessage || rule.message || `The ${fieldName} must be valid JSON.`;
      }
    }

    // Timezone validation
    if (rule.timezone) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: String(value) });
      } catch {
        return customMessage || rule.message || `The ${fieldName} must be a valid timezone.`;
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
  nullable: () => ({ nullable: true }),
  sometimes: () => ({ sometimes: true }),
  sometimesOr: (rules: any[]) => ({ sometimesOr: true, rules }),
  email: (message?: string) => ({ email: true, message }),
  min: (length: number, message?: string) => ({ minLength: length, message }),
  max: (length: number, message?: string) => ({ maxLength: length, message }),
  minValue: (value: number, message?: string) => ({ min: value, message }),
  maxValue: (value: number, message?: string) => ({ max: value, message }),
  numeric: (message?: string) => ({ numeric: true, message }),
  integer: (message?: string) => ({ integer: true, message }),
  alpha: (message?: string) => ({ alpha: true, message }),
  alphaNumeric: (message?: string) => ({ alphaNumeric: true, message }),
  alphaDash: (message?: string) => ({ alphaDash: true, message }),
  url: (message?: string) => ({ url: true, message }),
  uuid: (message?: string) => ({ uuid: true, message }),
  date: (message?: string) => ({ date: true, message }),
  dateFormat: (format: string, message?: string) => ({ dateFormat: format, message }),
  before: (date: string | Date, message?: string) => ({ before: date, message }),
  after: (date: string | Date, message?: string) => ({ after: date, message }),
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
  regex: (pattern: RegExp, message?: string) => ({ regex: pattern, message }),
  size: (size: number, message?: string) => ({ size: size, message }),
  between: (min: number, max: number, message?: string) => ({ between: { min, max }, message }),
  startsWith: (prefix: string, message?: string) => ({ startsWith: prefix, message }),
  endsWith: (suffix: string, message?: string) => ({ endsWith: suffix, message }),
  contains: (value: string, message?: string) => ({ contains: value, message }),
  ip: (message?: string) => ({ ip: true, message }),
  ipv4: (message?: string) => ({ ipv4: true, message }),
  ipv6: (message?: string) => ({ ipv6: true, message }),
  json: (message?: string) => ({ json: true, message }),
  file: (message?: string) => ({ file: true, message }),
  image: (message?: string) => ({ image: true, message }),
  mimes: (mimes: string[], message?: string) => ({ mimes: mimes, message }),
  mimeTypes: (types: string[], message?: string) => ({ mimeTypes: types, message }),
  dimensions: (constraints: Record<string, any>, message?: string) => ({ dimensions: constraints, message }),
  accepted: (message?: string) => ({ accepted: true, message }),
  activeUrl: (message?: string) => ({ activeUrl: true, message }),
  afterOrEqual: (date: string | Date, message?: string) => ({ afterOrEqual: date, message }),
  beforeOrEqual: (date: string | Date, message?: string) => ({ beforeOrEqual: date, message }),
  bail: () => ({ bail: true }),
  filled: (message?: string) => ({ filled: true, message }),
  present: (message?: string) => ({ present: true, message }),
  requiredIf: (field: string, value: any, message?: string) => ({ requiredIf: { field, value }, message }),
  requiredUnless: (field: string, value: any, message?: string) => ({ requiredUnless: { field, value }, message }),
  requiredWith: (fields: string[], message?: string) => ({ requiredWith: fields, message }),
  requiredWithAll: (fields: string[], message?: string) => ({ requiredWithAll: fields, message }),
  requiredWithout: (fields: string[], message?: string) => ({ requiredWithout: fields, message }),
  requiredWithoutAll: (fields: string[], message?: string) => ({ requiredWithoutAll: fields, message }),
  timezone: (message?: string) => ({ timezone: true, message }),
};
