export function calculateReservationPrice(
  startTime: Date,
  endTime: Date,
  pricePerHour: number,
): number {
  const durationInMilliseconds = endTime.getTime() - startTime.getTime();
  const durationInHours = durationInMilliseconds / (1000 * 60 * 60);
  const rawPrice = durationInHours * pricePerHour;

  return Number(rawPrice.toFixed(2));
}
