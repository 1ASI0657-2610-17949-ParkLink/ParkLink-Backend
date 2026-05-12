"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
function isErrorResponseBody(value) {
    return typeof value === 'object' && value !== null;
}
function extractMessage(exception) {
    if (exception instanceof common_1.HttpException) {
        const responseBody = exception.getResponse();
        if (typeof responseBody === 'string') {
            return responseBody;
        }
        if (isErrorResponseBody(responseBody) && responseBody.message !== undefined) {
            if (Array.isArray(responseBody.message)) {
                return responseBody.message.map(String).join(', ');
            }
            return String(responseBody.message);
        }
        return exception.message;
    }
    if (exception instanceof Error) {
        return exception.message;
    }
    return 'Unexpected internal server error';
}
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const context = host.switchToHttp();
        const response = context.getResponse();
        const request = context.getRequest();
        const statusCode = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const body = {
            success: false,
            statusCode,
            message: extractMessage(exception),
            timestamp: new Date().toISOString(),
            path: request.url,
            data: null,
        };
        response.status(statusCode).json(body);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map