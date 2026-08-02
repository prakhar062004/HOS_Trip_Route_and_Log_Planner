import type { RecapDay } from '../types';


export interface RecapCalculations {
  todayHours: number;
  prev7DaysTotal: number;
  past8DaysTotal: number;
  hoursAvailableTomorrow: number;
  cycleRemaining: number;
  cycleLimit: number;
  violations: string[];
}

/**
 * Computes all HOS recap metrics given an 8-day history of hours.
 * The 8th day represents today.
 *
 * @param recapDays Array of exactly 8 days. The last day (index 7) is today.
 * @param todayDrivingHours The number of driving hours today (to check the 11-hour limit).
 * @param todayOnDutyHours The number of on-duty (not driving) hours today.
 */
export function calculateRecap(
  recapDays: RecapDay[],
  todayDrivingHours: number,
  todayOnDutyHours: number
): RecapCalculations {
  const cycleLimit = 70;
  const todayTotal = todayDrivingHours + todayOnDutyHours;

  // Clone recapDays and update today (index 7) with the active totals
  const updatedDays = [...recapDays];
  if (updatedDays.length >= 8) {
    updatedDays[7] = {
      ...updatedDays[7],
      hoursWorked: todayTotal,
    };
  }

  // 1. Sum of previous 7 days (index 0 to 6)
  const prev7DaysTotal = updatedDays
    .slice(0, 7)
    .reduce((sum, day) => sum + day.hoursWorked, 0);

  // 2. Sum of past 8 days (index 0 to 7)
  const past8DaysTotal = prev7DaysTotal + todayTotal;

  // 3. Cycle remaining today
  const cycleRemaining = Math.max(0, cycleLimit - past8DaysTotal);

  // 4. Hours available tomorrow (70 minus the last 7 days including today: index 1 to 7)
  const last7DaysIncludingToday = updatedDays
    .slice(1, 8)
    .reduce((sum, day) => sum + day.hoursWorked, 0);
  const hoursAvailableTomorrow = Math.max(0, cycleLimit - last7DaysIncludingToday);

  // HOS Rule Violations checking
  const violations: string[] = [];

  // Daily driving limit check (11 Hours)
  if (todayDrivingHours > 11) {
    violations.push(`Driving Limit Violated: Spent ${todayDrivingHours.toFixed(2)} hours driving today (Maximum allowed is 11 hours).`);
  }

  // Daily on-duty limit check (14 Hours)
  if (todayTotal > 14) {
    violations.push(`On-Duty Limit Violated: Spent ${todayTotal.toFixed(2)} hours on duty today (Maximum allowed is 14 hours).`);
  }

  // 70-hour rolling rule limit check
  if (past8DaysTotal > 70) {
    violations.push(`70-Hour Rule Violated: Accumulated ${past8DaysTotal.toFixed(2)} hours over 8 days (Maximum allowed is 70 hours).`);
  }

  return {
    todayHours: todayTotal,
    prev7DaysTotal: Math.round(prev7DaysTotal * 100) / 100,
    past8DaysTotal: Math.round(past8DaysTotal * 100) / 100,
    hoursAvailableTomorrow: Math.round(hoursAvailableTomorrow * 100) / 100,
    cycleRemaining: Math.round(cycleRemaining * 100) / 100,
    cycleLimit,
    violations,
  };
}
