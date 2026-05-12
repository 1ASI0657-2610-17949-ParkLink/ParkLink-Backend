export function generateReservationCode(): string {
  const timestampSegment = Date.now().toString(36).toUpperCase();
  const randomSegment = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `PKL-${timestampSegment}-${randomSegment}`;
}
