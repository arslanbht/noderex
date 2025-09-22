"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const app_1 = require("../../config/app");
/**
 * Global error handler middleware
 */
function errorHandler(error, req, res, next) {
    // Log error in development
    if (app_1.app.debug) {
        console.error('Error:', error);
    }
    // Default error response
    let status = 500;
    let message = 'Internal Server Error';
    let errors;
    // Handle specific error types
    if (error.name === 'ValidationException') {
        status = 422;
        message = 'Validation failed';
        errors = error.errors;
    }
    else if (error.name === 'UnauthorizedError') {
        status = 401;
        message = 'Unauthorized';
    }
    else if (error.name === 'ForbiddenError') {
        status = 403;
        message = 'Forbidden';
    }
    else if (error.name === 'NotFoundError') {
        status = 404;
        message = 'Not found';
    }
    else if (error.name === 'ConflictError') {
        status = 409;
        message = 'Conflict';
    }
    else if (error.name === 'TooManyRequestsError') {
        status = 429;
        message = 'Too many requests';
    }
    else if (error.status) {
        status = error.status;
        message = error.message || message;
    }
    // Build error response
    const errorResponse = {
        success: false,
        message,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
    };
    // Include errors if available
    if (errors) {
        errorResponse.errors = errors;
    }
    // Include stack trace in development
    if (app_1.app.debug && error.stack) {
        errorResponse.stack = error.stack;
    }
    res.status(status).json(errorResponse);
}
//# sourceMappingURL=ErrorHandler.js.map