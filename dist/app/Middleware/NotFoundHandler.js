"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
/**
 * 404 Not Found handler middleware
 */
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
}
//# sourceMappingURL=NotFoundHandler.js.map