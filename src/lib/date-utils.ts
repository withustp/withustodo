import { differenceInCalendarDays, format, isValid, parseISO } from 'date-fns';

export interface DueDateStatus {
  formattedDate: string;
  remainingText: string;
  fullLabel: string;
  diffDays: number;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  isSoon: boolean;
}

/**
 * Calculates human-readable due date status with days remaining and D-Day countdown.
 *
 * @param dueDate - Task due date as ISO string or Date object
 * @param isDone - Whether the task is completed
 * @param locale - Formatting language ('ko' | 'en')
 * @returns DueDateStatus with detailed countdown attributes
 */
export function getDueDateStatus(
  dueDate: string | Date | null | undefined,
  isDone = false,
  locale: 'ko' | 'en' = 'ko'
): DueDateStatus | null {
  if (!dueDate) return null;
  const target = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  if (!isValid(target)) return null;

  const today = new Date();
  const diffDays = differenceInCalendarDays(target, today);
  const formattedDate = format(target, 'MMM d');
  const isKo = locale === 'ko';

  if (isDone) {
    return {
      formattedDate,
      remainingText: '',
      fullLabel: formattedDate,
      diffDays,
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
      isSoon: false,
    };
  }

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    const remainingText = isKo
      ? `기한 초과 · ${overdueDays}일 지남`
      : `Overdue · ${overdueDays}d ago`;
    return {
      formattedDate,
      remainingText,
      fullLabel: `${formattedDate} (${remainingText})`,
      diffDays,
      isOverdue: true,
      isToday: false,
      isTomorrow: false,
      isSoon: false,
    };
  }

  if (diffDays === 0) {
    const remainingText = isKo ? '오늘 마감 · D-Day' : 'Due today · D-Day';
    return {
      formattedDate,
      remainingText,
      fullLabel: `${formattedDate} (${remainingText})`,
      diffDays: 0,
      isOverdue: false,
      isToday: true,
      isTomorrow: false,
      isSoon: true,
    };
  }

  if (diffDays === 1) {
    const remainingText = isKo ? '내일 마감 · 1일 남음 · D-1' : 'Tomorrow · 1d left · D-1';
    return {
      formattedDate,
      remainingText,
      fullLabel: `${formattedDate} (${remainingText})`,
      diffDays: 1,
      isOverdue: false,
      isToday: false,
      isTomorrow: true,
      isSoon: true,
    };
  }

  const remainingText = isKo
    ? `${diffDays}일 남음 · D-${diffDays}`
    : `${diffDays} days left · D-${diffDays}`;

  return {
    formattedDate,
    remainingText,
    fullLabel: `${formattedDate} (${remainingText})`,
    diffDays,
    isOverdue: false,
    isToday: false,
    isTomorrow: false,
    isSoon: diffDays <= 3,
  };
}
