import type { LogInterval, DutyStatus } from '../types';

import { timeToMinutes } from './timeToPixels';

/**
 * Calculates the total hours spent in each duty status.
 * Values are returned as decimal hours (e.g., 8.25, 2.50).
 */
export function calculateHours(intervals: LogInterval[]): Record<DutyStatus, number> {
  const totals: Record<DutyStatus, number> = {
    OFF_DUTY: 0,
    SLEEPER: 0,
    DRIVING: 0,
    ON_DUTY: 0,
  };

  intervals.forEach((interval) => {
    const startMins = timeToMinutes(interval.start);
    // End time can be "24:00" which equals 1440 minutes
    const endMins = interval.end === '24:00' ? 1440 : timeToMinutes(interval.end);
    const durationMins = Math.max(0, endMins - startMins);
    totals[interval.status] += durationMins / 60;
  });

  // Round values to 2 decimal places to prevent float precision issues (like 7.000000000004)
  (Object.keys(totals) as DutyStatus[]).forEach((status) => {
    totals[status] = Math.round(totals[status] * 100) / 100;
  });

  return totals;
}

/**
 * Checks if the total hours across all statuses sum up to exactly 24 hours.
 */
export function validate24Hours(totals: Record<DutyStatus, number>): boolean {
  const sum = Object.values(totals).reduce((acc, curr) => acc + curr, 0);
  return Math.abs(sum - 24) < 0.001;
}
