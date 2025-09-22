import { Request as ExpressRequest, Response, NextFunction } from 'express';
/**
 * Base Request class for NodeRex framework
 * Provides validation functionality for incoming requests
 */
export declare abstract class Request {
    abstract rules(): Record<string, any>;
    /**
     * Custom validation messages
     */
    messages(): Record<string, string>;
    /**
     * Custom attribute names for validation messages
     */
    attributes(): Record<string, string>;
    /**
     * Validate the request data
     */
    validate(): Promise<boolean>;
    /**
     * Get validation rules for a specific field
     */
    getRule(field: string): any;
    /**
     * Check if a field has validation rules
     */
    hasRule(field: string): boolean;
}
/**
 * Validation Exception class
 */
export declare class ValidationException extends Error {
    errors: Record<string, string[]>;
    constructor(errors: Record<string, string[]>);
    /**
     * Get formatted errors for API response
     */
    getFormattedErrors(): Record<string, string[]>;
}
/**
 * Middleware function to validate requests
 */
export declare function validateRequest<T extends Request>(RequestClass: new () => T): (req: ExpressRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Common validation decorators
 */
export declare function Required(message?: string): (target: any, propertyKey: string) => void;
export declare function Email(message?: string): (target: any, propertyKey: string) => void;
export declare function MinLength(length: number, message?: string): (target: any, propertyKey: string) => void;
export declare function MaxLength(length: number, message?: string): (target: any, propertyKey: string) => void;
export declare function Unique(table: string, column: string, message?: string): (target: any, propertyKey: string) => void;
export declare function Exists(table: string, column: string, message?: string): (target: any, propertyKey: string) => void;
/**
 * Helper function to create validation rules
 */
export declare const Validation: {
    required: (message?: string) => {
        required: boolean;
        message: string | undefined;
    };
    email: (message?: string) => {
        email: boolean;
        message: string | undefined;
    };
    min: (length: number, message?: string) => {
        minLength: number;
        message: string | undefined;
    };
    max: (length: number, message?: string) => {
        maxLength: number;
        message: string | undefined;
    };
    minValue: (value: number, message?: string) => {
        min: number;
        message: string | undefined;
    };
    maxValue: (value: number, message?: string) => {
        max: number;
        message: string | undefined;
    };
    numeric: (message?: string) => {
        numeric: boolean;
        message: string | undefined;
    };
    alpha: (message?: string) => {
        alpha: boolean;
        message: string | undefined;
    };
    alphaNumeric: (message?: string) => {
        alphaNumeric: boolean;
        message: string | undefined;
    };
    url: (message?: string) => {
        url: boolean;
        message: string | undefined;
    };
    uuid: (message?: string) => {
        uuid: boolean;
        message: string | undefined;
    };
    date: (message?: string) => {
        date: boolean;
        message: string | undefined;
    };
    boolean: (message?: string) => {
        boolean: boolean;
        message: string | undefined;
    };
    array: (message?: string) => {
        array: boolean;
        message: string | undefined;
    };
    object: (message?: string) => {
        object: boolean;
        message: string | undefined;
    };
    confirmed: (message?: string) => {
        confirmed: boolean;
        message: string | undefined;
    };
    different: (field: string, message?: string) => {
        different: string;
        message: string | undefined;
    };
    same: (field: string, message?: string) => {
        same: string;
        message: string | undefined;
    };
    unique: (table: string, column: string, message?: string) => {
        unique: string;
        message: string | undefined;
    };
    exists: (table: string, column: string, message?: string) => {
        exists: string;
        message: string | undefined;
    };
    in: (values: any[], message?: string) => {
        in: any[];
        message: string | undefined;
    };
    notIn: (values: any[], message?: string) => {
        notIn: any[];
        message: string | undefined;
    };
    regex: (pattern: RegExp, message?: string) => {
        regex: RegExp;
        message: string | undefined;
    };
};
//# sourceMappingURL=Request.d.ts.map