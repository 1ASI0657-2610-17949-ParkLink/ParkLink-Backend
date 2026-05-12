export function validateTimeRange(startTime: Date, endTime: Date): boolean {
  return startTime instanceof Date && endTime instanceof Date && startTime < endTime;
}
