/**
 * Converts a time string (HH:MM) into total minutes from midnight.
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return 0;
  return hours * 60 + minutes;
}

/**
 * Converts total minutes from midnight into a time string (HH:MM in 24h format).
 */
export function minutesToTime(minutes: number): string {
  const bounded = Math.max(0, Math.min(1439, minutes));
  const h = Math.floor(bounded / 60);
  const m = Math.floor(bounded % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Converts a time string (HH:MM) to an X coordinate on the SVG canvas.
 */
export function timeToX(timeStr: string, width: number): number {
  const minutes = timeToMinutes(timeStr);
  return (minutes / 1440) * width;
}

/**
 * Converts an SVG X coordinate back to a time string, snapped to the nearest 15-minute interval.
 */
export function xToTime(x: number, width: number, snapInterval = 15): string {
  const percentage = Math.max(0, Math.min(1, x / width));
  const totalMinutes = percentage * 1440;
  
  // Snap to interval (e.g. 15 minutes)
  const snappedMinutes = Math.round(totalMinutes / snapInterval) * snapInterval;
  
  // Guard 24:00 back to 23:59 or 24:00 depending on use case.
  // We represent end of day as 24:00, but internally we can limit or handle it.
  if (snappedMinutes >= 1440) {
    return '24:00';
  }
  
  return minutesToTime(snappedMinutes);
}

/**
 * Formats a 24-hour time string into a 12-hour AM/PM string for display.
 */
export function format12Hour(timeStr: string): string {
  if (timeStr === '24:00') return '12:00 AM';
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return '';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}
