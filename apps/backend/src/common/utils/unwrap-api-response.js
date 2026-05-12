"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unwrapApiResponse = unwrapApiResponse;
function isApiResponse(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'success' in value &&
        typeof value.success === 'boolean');
}
function unwrapApiResponse(payload) {
    if (isApiResponse(payload)) {
        return payload.data;
    }
    return payload;
}
//# sourceMappingURL=unwrap-api-response.js.map