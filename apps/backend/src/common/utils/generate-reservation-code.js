"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReservationCode = generateReservationCode;
function generateReservationCode() {
    const timestampSegment = Date.now().toString(36).toUpperCase();
    const randomSegment = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `PKL-${timestampSegment}-${randomSegment}`;
}
//# sourceMappingURL=generate-reservation-code.js.map