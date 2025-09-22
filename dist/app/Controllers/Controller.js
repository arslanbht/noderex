"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
/**
 * Base Controller class for NodeRex framework
 * Provides common functionality for all controllers
 */
class Controller {
    /**
     * Set the request, response, and next function
     */
    setContext(req, res, next) {
        this.request = req;
        this.response = res;
        this.next = next;
    }
    /**
     * Get the request object
     */
    getRequest() {
        return this.request;
    }
    /**
     * Get the response object
     */
    getResponse() {
        return this.response;
    }
    /**
     * Get the next function
     */
    getNext() {
        return this.next;
    }
    /**
     * Get all input from request
     */
    all() {
        return { ...this.request.body, ...this.request.query, ...this.request.params };
    }
    /**
     * Get input by key
     */
    input(key, defaultValue = null) {
        return this.request.body[key] ||
            this.request.query[key] ||
            this.request.params[key] ||
            defaultValue;
    }
    /**
     * Get only specified inputs
     */
    only(keys) {
        const result = {};
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
    except(keys) {
        const result = this.all();
        keys.forEach(key => {
            delete result[key];
        });
        return result;
    }
    /**
     * Validate that input exists
     */
    has(key) {
        const allInputs = this.all();
        return key in allInputs && allInputs[key] !== null && allInputs[key] !== undefined;
    }
    /**
     * Validate that input exists and is not empty
     */
    filled(key) {
        const value = this.input(key);
        return value !== null && value !== undefined && value !== '';
    }
    /**
     * Send JSON response
     */
    json(data, status = 200) {
        return this.response.status(status).json(data);
    }
    /**
     * Send success response
     */
    success(data, message = 'Success', status = 200) {
        return this.response.status(status).json({
            success: true,
            message,
            data
        });
    }
    /**
     * Send error response
     */
    error(message = 'Error', status = 400, errors) {
        const response = {
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
    validationError(errors) {
        return this.error('Validation failed', 422, errors);
    }
    /**
     * Send not found response
     */
    notFound(message = 'Not found') {
        return this.error(message, 404);
    }
    /**
     * Send unauthorized response
     */
    unauthorized(message = 'Unauthorized') {
        return this.error(message, 401);
    }
    /**
     * Send forbidden response
     */
    forbidden(message = 'Forbidden') {
        return this.error(message, 403);
    }
    /**
     * Send created response
     */
    created(data, message = 'Created successfully') {
        return this.success(data, message, 201);
    }
    /**
     * Send no content response
     */
    noContent() {
        return this.response.status(204).send();
    }
}
exports.Controller = Controller;
//# sourceMappingURL=Controller.js.map