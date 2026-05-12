"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateReservationPrice = calculateReservationPrice;
function calculateReservationPrice(startTime, endTime, pricePerHour) {
    const durationInMilliseconds = endTime.getTime() - startTime.getTime();
    const durationInHours = durationInMilliseconds / (1000 * 60 * 60);
    const rawPrice = durationInHours * pricePerHour;
    return Number(rawPrice.toFixed(2));
}
//# sourceMappingURL=calculate-reservation-price.js.map