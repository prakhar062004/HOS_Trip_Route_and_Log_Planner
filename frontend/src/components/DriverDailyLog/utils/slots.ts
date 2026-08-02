import type { DutyStatus, LogInterval, RemarkEntry } from '../types';

import { timeToMinutes, minutesToTime } from './timeToPixels';

/**
 * Converts log intervals to a flat array of 96 statuses (15-minute slots).
 */
export function intervalsToSlots(intervals: LogInterval[]): DutyStatus[] {
  const slots = Array<DutyStatus>(96).fill('OFF_DUTY');
  
  intervals.forEach((interval) => {
    const startMins = timeToMinutes(interval.start);
    const endMins = interval.end === '24:00' ? 1440 : timeToMinutes(interval.end);
    
    const startSlot = Math.max(0, Math.floor(startMins / 15));
    const endSlot = Math.min(96, Math.floor(endMins / 15));
    
    for (let i = startSlot; i < endSlot; i++) {
      slots[i] = interval.status;
    }
  });
  
  return slots;
}

/**
 * Converts a flat array of 96 statuses back to simplified, continuous log intervals.
 */
export function slotsToIntervals(slots: DutyStatus[]): LogInterval[] {
  const intervals: LogInterval[] = [];
  if (slots.length === 0) return [];
  
  let currentStatus = slots[0];
  let startSlot = 0;

  for (let i = 1; i <= 96; i++) {
    const status = i < 96 ? slots[i] : null;
    
    if (status !== currentStatus || i === 96) {
      const startStr = minutesToTime(startSlot * 15);
      const endStr = i === 96 ? '24:00' : minutesToTime(i * 15);
      
      intervals.push({
        start: startStr,
        end: endStr,
        status: currentStatus,
      });
      
      if (i < 96 && status !== null) {
        currentStatus = status;
        startSlot = i;
      }
    }
  }

  return intervals;
}

/**
 * Synchronizes the remarks list with duty status change transition times.
 * Preserves user entries for location and text while cleaning up old transitions.
 */
export function syncRemarksWithIntervals(
  intervals: LogInterval[],
  currentRemarks: RemarkEntry[]
): RemarkEntry[] {
  // A transition occurs at the start of any interval that is not '00:00'
  const transitions = intervals.filter((int) => int.start !== '00:00');
  
  // Map current remarks by time for fast lookups
  const remarkMap = new Map<string, RemarkEntry>();
  currentRemarks.forEach((r) => remarkMap.set(r.time, r));

  const updated: RemarkEntry[] = [];
  
  // If there's an existing remark for the start of the day, keep it
  if (remarkMap.has('00:00')) {
    updated.push(remarkMap.get('00:00')!);
  }

  // Process all transitions
  transitions.forEach((trans) => {
    if (remarkMap.has(trans.start)) {
      // Keep existing remark, update its status
      const existing = remarkMap.get(trans.start)!;
      updated.push({
        ...existing,
        status: trans.status,
      });
    } else {
      // Create a brand new remark for this status change
      updated.push({
        id: Math.random().toString(36).substring(2, 9),
        time: trans.start,
        status: trans.status,
        location: '',
        text: '',
      });
    }
  });

  // Keep manual remarks that don't align with strict transition boundaries
  const transitionTimes = new Set(transitions.map((t) => t.start));
  transitionTimes.add('00:00');

  currentRemarks.forEach((r) => {
    if (!transitionTimes.has(r.time)) {
      updated.push(r);
    }
  });

  // Sort remarks chronologically by time
  return updated.sort((a, b) => a.time.localeCompare(b.time));
}
