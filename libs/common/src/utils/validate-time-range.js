"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTimeRange = validateTimeRange;
function validateTimeRange(startTime, endTime) {
    return startTime instanceof Date && endTime instanceof Date && startTime < endTime;
}
//# sourceMappingURL=validate-time-range.js.map