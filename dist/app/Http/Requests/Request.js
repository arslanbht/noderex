"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validation = exports.ValidationException = exports.Request = void 0;
exports.validateRequest = validateRequest;
exports.Required = Required;
exports.Email = Email;
exports.MinLength = MinLength;
exports.MaxLength = MaxLength;
exports.Unique = Unique;
exports.Exists = Exists;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
/**
 * Base Request class for NodeRex framework
 * Provides validation functionality for incoming requests
 */
class Request {
    /**
     * Custom validation messages
     */
    messages() {
        return {};
    }
    /**
     * Custom attribute names for validation messages
     */
    attributes() {
        return {};
    }
    /**
     * Validate the request data
     */
    async validate() {
        const validationErrors = await (0, class_validator_1.validate)(this);
        if (validationErrors.length > 0) {
            const errors = {};
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
    getRule(field) {
        const rules = this.rules();
        return rules[field];
    }
    /**
     * Check if a field has validation rules
     */
    hasRule(field) {
        return field in this.rules();
    }
}
exports.Request = Request;
/**
 * Validation Exception class
 */
class ValidationException extends Error {
    constructor(errors) {
        super('Validation failed');
        this.errors = errors;
        this.name = 'ValidationException';
    }
    /**
     * Get formatted errors for API response
     */
    getFormattedErrors() {
        return this.errors;
    }
}
exports.ValidationException = ValidationException;
/**
 * Middleware function to validate requests
 */
function validateRequest(RequestClass) {
    return async (req, res, next) => {
        try {
            // Transform plain object to class instance
            const request = (0, class_transformer_1.plainToClass)(RequestClass, req.body);
            // Validate the request
            await request.validate();
            // Attach validated data to request object
            req.body = request;
            next();
        }
        catch (error) {
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
function Required(message) {
    return function (target, propertyKey) {
        // This would be implemented with class-validator decorators
        // For now, we'll use the rules() method approach
    };
}
function Email(message) {
    return function (target, propertyKey) {
        // This would be implemented with class-validator decorators
    };
}
function MinLength(length, message) {
    return function (target, propertyKey) {
        // This would be implemented with class-validator decorators
    };
}
function MaxLength(length, message) {
    return function (target, propertyKey) {
        // This would be implemented with class-validator decorators
    };
}
function Unique(table, column, message) {
    return function (target, propertyKey) {
        // This would be implemented with custom validation
    };
}
function Exists(table, column, message) {
    return function (target, propertyKey) {
        // This would be implemented with custom validation
    };
}
/**
 * Helper function to create validation rules
 */
exports.Validation = {
    required: (message) => ({ required: true, message }),
    email: (message) => ({ email: true, message }),
    min: (length, message) => ({ minLength: length, message }),
    max: (length, message) => ({ maxLength: length, message }),
    minValue: (value, message) => ({ min: value, message }),
    maxValue: (value, message) => ({ max: value, message }),
    numeric: (message) => ({ numeric: true, message }),
    alpha: (message) => ({ alpha: true, message }),
    alphaNumeric: (message) => ({ alphaNumeric: true, message }),
    url: (message) => ({ url: true, message }),
    uuid: (message) => ({ uuid: true, message }),
    date: (message) => ({ date: true, message }),
    boolean: (message) => ({ boolean: true, message }),
    array: (message) => ({ array: true, message }),
    object: (message) => ({ object: true, message }),
    confirmed: (message) => ({ confirmed: true, message }),
    different: (field, message) => ({ different: field, message }),
    same: (field, message) => ({ same: field, message }),
    unique: (table, column, message) => ({ unique: `${table}.${column}`, message }),
    exists: (table, column, message) => ({ exists: `${table}.${column}`, message }),
    in: (values, message) => ({ in: values, message }),
    notIn: (values, message) => ({ notIn: values, message }),
    regex: (pattern, message) => ({ regex: pattern, message })
};
//# sourceMappingURL=Request.js.map