import type { LogInterval, DutyStatus } from '../types';

import { timeToX, timeToMinutes } from './timeToPixels';

/**
 * Gets the vertical coordinate for a given duty status inside the SVG grid.
 */
export function getStatusY(status: DutyStatus, rowHeight: number): number {
  switch (status) {
    case 'OFF_DUTY':
      return rowHeight * 0 + rowHeight / 2;
    case 'SLEEPER':
      return rowHeight * 1 + rowHeight / 2;
    case 'DRIVING':
      return rowHeight * 2 + rowHeight / 2;
    case 'ON_DUTY':
      return rowHeight * 3 + rowHeight / 2;
    default:
      return rowHeight / 2;
  }
}

/**
 * Sorts intervals and fills any gaps with 'OFF_DUTY' to ensure a continuous 24-hour log.
 */
export function sanitizeAndFillIntervals(intervals: LogInterval[]): LogInterval[] {
  if (intervals.length === 0) {
    return [{ start: '00:00', end: '24:00', status: 'OFF_DUTY' }];
  }

  // Clone and sort by start time
  const sorted = [...intervals].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  const filled: LogInterval[] = [];

  let currentMin = 0;

  for (let i = 0; i < sorted.length; i++) {
    const interval = sorted[i];
    const startMin = timeToMinutes(interval.start);
    const endMin = interval.end === '24:00' ? 1440 : timeToMinutes(interval.end);

    // If there is a gap before this interval starts
    if (startMin > currentMin) {
      filled.push({
        start: minutesToTimeStr(currentMin),
        end: minutesToTimeStr(startMin),
        status: 'OFF_DUTY',
      });
    }

    // Add this interval (bound it correctly)
    filled.push({
      start: minutesToTimeStr(Math.max(currentMin, startMin)),
      end: minutesToTimeStr(endMin),
      status: interval.status,
    });

    currentMin = Math.max(currentMin, endMin);
  }

  // If there's a remaining gap at the end of the day
  if (currentMin < 1440) {
    filled.push({
      start: minutesToTimeStr(currentMin),
      end: '24:00',
      status: 'OFF_DUTY',
    });
  }

  return filled;
}

/**
 * Helper to convert minutes to HH:MM string (ensures leading zeros)
 */
function minutesToTimeStr(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Generates a standard SVG path data string ('M ... L ...') representing the duty status logs.
 */
export function generateSVGPath(
  intervals: LogInterval[],
  width: number,
  rowHeight: number
): string {
  const continuousLogs = sanitizeAndFillIntervals(intervals);
  if (continuousLogs.length === 0) return '';

  let pathData = '';

  continuousLogs.forEach((interval, index) => {
    const xStart = timeToX(interval.start, width);
    const xEnd = timeToX(interval.end, width);
    const yVal = getStatusY(interval.status, rowHeight);

    if (index === 0) {
      // Move to start point
      pathData += `M ${xStart.toFixed(1)} ${yVal.toFixed(1)}`;
    } else {
      // Draw vertical line from previous Y level to current Y level at xStart
      pathData += ` L ${xStart.toFixed(1)} ${yVal.toFixed(1)}`;
    }

    // Draw horizontal line to the end of this interval
    pathData += ` L ${xEnd.toFixed(1)} ${yVal.toFixed(1)}`;
  });

  return pathData;
}
