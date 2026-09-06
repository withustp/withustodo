import {
  addDays,
  addWeeks,
  addMonths,
  getDay,
  getDate,
  setDate,
  getDaysInMonth,
  isAfter,
  endOfDay,
  startOfDay,
  format,
  parseISO,
  isValid
} from 'date-fns';
import { RecurringPattern } from '@/types';

/**
 * Calculates the next due date for a recurring task based on its pattern and current due date.
 *
 * @param currentDueDate - The base due date (ISO string or Date object)
 * @param pattern - Recurrence pattern defining frequency, interval, weekdays, and end date
 * @returns The next Date instance or null if the recurrence has passed its end date
 */
export function calculateNextDueDate(
  currentDueDate: string | Date | null | undefined,
  pattern: RecurringPattern
): Date | null {
  if (!pattern || !pattern.type) return null;

  const baseDate = currentDueDate
    ? (typeof currentDueDate === 'string' ? parseISO(currentDueDate) : new Date(currentDueDate))
    : new Date();

  const validBase = isValid(baseDate) ? baseDate : new Date();
  const interval = Math.max(1, pattern.interval || 1);

  let nextDate: Date;

  switch (pattern.type) {
    case 'daily': {
      nextDate = addDays(validBase, interval);
      break;
    }

    case 'weekly': {
      const currentDayOfWeek = getDay(validBase); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      const targetDays = (pattern.days_of_week && pattern.days_of_week.length > 0)
        ? [...pattern.days_of_week].sort((a, b) => a - b)
        : [currentDayOfWeek];

      // Check if there is another selected weekday later in the current week
      const nextDayInCurrentWeek = targetDays.find((day) => day > currentDayOfWeek);

      if (nextDayInCurrentWeek !== undefined) {
        const diffDays = nextDayInCurrentWeek - currentDayOfWeek;
        nextDate = addDays(validBase, diffDays);
      } else {
        // Wrap around to the first selected day of the next interval week
        const firstTargetDay = targetDays[0];
        // Advance by interval weeks from the start of current week
        const daysToNextWeekStart = 7 - currentDayOfWeek;
        const weeksToAdd = interval - 1;
        const totalDaysToAdd = daysToNextWeekStart + (weeksToAdd * 7) + firstTargetDay;
        nextDate = addDays(validBase, totalDaysToAdd);
      }
      break;
    }

    case 'monthly': {
      // Advance by specified month interval
      const advancedMonthDate = addMonths(validBase, interval);
      const targetDayOfMonth = pattern.day_of_month || getDate(validBase);
      const maxDaysInTargetMonth = getDaysInMonth(advancedMonthDate);

      // Clamp to month end (e.g. Jan 31 -> Feb 28/29)
      const clampedDay = Math.min(targetDayOfMonth, maxDaysInTargetMonth);
      nextDate = setDate(advancedMonthDate, clampedDay);
      break;
    }

    default:
      return null;
  }

  // Verify end_date boundary condition
  if (pattern.end_date) {
    const parsedEnd = typeof pattern.end_date === 'string' ? parseISO(pattern.end_date) : new Date(pattern.end_date);
    if (isValid(parsedEnd)) {
      const boundary = endOfDay(parsedEnd);
      if (isAfter(startOfDay(nextDate), boundary)) {
        return null;
      }
    }
  }

  return nextDate;
}

/**
 * Generates a localized human-readable summary description for a recurrence pattern.
 *
 * @param pattern - The recurring pattern configuration
 * @param locale - Locale code ('ko' or 'en')
 * @returns Formatted summary string
 */
export function formatRecurrenceSummary(
  pattern: RecurringPattern,
  locale: 'ko' | 'en' = 'ko'
): string {
  if (!pattern) return '';

  const isKo = locale === 'ko';
  const interval = pattern.interval || 1;
  const daysKo = ['일', '월', '화', '수', '목', '금', '토'];
  const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let summary = '';

  switch (pattern.type) {
    case 'daily':
      if (interval === 1) {
        summary = isKo ? '매일' : 'Daily';
      } else {
        summary = isKo ? `${interval}일마다` : `Every ${interval} days`;
      }
      break;

    case 'weekly': {
      const days = pattern.days_of_week && pattern.days_of_week.length > 0
        ? pattern.days_of_week.map((d) => (isKo ? daysKo[d] : daysEn[d])).join(', ')
        : '';

      if (interval === 1) {
        summary = isKo
          ? (days ? `매주 (${days})` : '매주')
          : (days ? `Weekly on ${days}` : 'Weekly');
      } else {
        summary = isKo
          ? (days ? `${interval}주마다 (${days})` : `${interval}주마다`)
          : (days ? `Every ${interval} weeks on ${days}` : `Every ${interval} weeks`);
      }
      break;
    }

    case 'monthly':
      if (interval === 1) {
        summary = isKo
          ? (pattern.day_of_month ? `매월 ${pattern.day_of_month}일` : '매월')
          : (pattern.day_of_month ? `Monthly on day ${pattern.day_of_month}` : 'Monthly');
      } else {
        summary = isKo
          ? (pattern.day_of_month ? `${interval}개월마다 ${pattern.day_of_month}일` : `${interval}개월마다`)
          : (pattern.day_of_month ? `Every ${interval} months on day ${pattern.day_of_month}` : `Every ${interval} months`);
      }
      break;
  }

  if (pattern.end_date) {
    try {
      const endD = typeof pattern.end_date === 'string' ? parseISO(pattern.end_date) : new Date(pattern.end_date);
      if (isValid(endD)) {
        const formattedEnd = format(endD, 'yyyy-MM-dd');
        summary += isKo ? ` (~${formattedEnd}까지)` : ` (until ${formattedEnd})`;
      }
    } catch {
      // Ignore invalid date strings
    }
  }

  return summary;
}

const RECURRING_METADATA_REGEX = /<!--\s*recurring:\s*(\{[\s\S]*?\})\s*-->/;

/**
 * Extracts embedded recurrence pattern metadata from task description if present.
 *
 * @param description - Raw task description string
 * @returns Cleaned description and extracted RecurringPattern
 */
export function extractRecurrenceFromDescription(description: string | null | undefined): {
  cleanDescription: string | null;
  pattern: RecurringPattern | null;
} {
  if (!description) return { cleanDescription: null, pattern: null };
  const match = description.match(RECURRING_METADATA_REGEX);
  if (!match) return { cleanDescription: description, pattern: null };

  try {
    const parsed = JSON.parse(match[1]);
    const cleanDescription = description.replace(RECURRING_METADATA_REGEX, '').trim() || null;
    return { cleanDescription, pattern: parsed };
  } catch {
    return { cleanDescription: description, pattern: null };
  }
}

/**
 * Encodes recurrence pattern as markdown metadata attached to the description.
 *
 * @param description - Base task description
 * @param pattern - Recurrence pattern to attach
 * @returns Combined description string
 */
export function attachRecurrenceToDescription(
  description: string | null | undefined,
  pattern: RecurringPattern | null | undefined
): string | null {
  const base = description ? description.replace(RECURRING_METADATA_REGEX, '').trim() : '';
  if (!pattern) return base || null;

  const serialized = JSON.stringify(pattern);
  return base ? `${base}\n\n<!-- recurring: ${serialized} -->` : `<!-- recurring: ${serialized} -->`;
}

