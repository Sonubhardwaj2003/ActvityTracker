import {
  format,
  parseISO,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  eachDayOfInterval,
  isToday as isDateToday,
} from 'date-fns';

export const formatDateKey = (date) => {
  if (!date) return '';
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    date = new Date(date);
  }
  return format(date, 'yyyy-MM-dd');
};

export const getTodayDateKey = () => {
  return formatDateKey(new Date());
};

export const shiftDateKey = (dateKey, days) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return formatDateKey(addDays(dt, days));
};

export const formatDisplayDate = (dateKey) => {
  if (!dateKey) return '';
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return format(dt, 'EEEE, d MMMM yyyy');
};

export const formatShortDate = (dateKey) => {
  if (!dateKey) return '';
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return format(dt, 'd MMM');
};

export const formatDayOfWeek = (dateKey) => {
  if (!dateKey) return '';
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return format(dt, 'EEE');
};

export const isToday = (dateKey) => {
  return dateKey === getTodayDateKey();
};

export const isFuture = (dateKey) => {
  return dateKey > getTodayDateKey();
};

export const isPast = (dateKey) => {
  return dateKey < getTodayDateKey();
};

export const getWeekDates = (referenceDateKey, weekStartsOn = 1) => {
  const [y, m, d] = referenceDateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const start = startOfWeek(dt, { weekStartsOn });
  const end = endOfWeek(dt, { weekStartsOn });
  return eachDayOfInterval({ start, end }).map(formatDateKey);
};

export const getMonthGrid = (year, month, weekStartsOn = 1) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = endOfMonth(firstDay);

  const start = startOfWeek(firstDay, { weekStartsOn });
  const end = endOfWeek(lastDay, { weekStartsOn });

  return eachDayOfInterval({ start, end }).map((dt) => ({
    dateKey: formatDateKey(dt),
    day: dt.getDate(),
    isCurrentMonth: dt.getMonth() === month,
    isToday: formatDateKey(dt) === getTodayDateKey(),
  }));
};

export const getDateRangePresets = () => {
  const now = new Date();
  const todayKey = formatDateKey(now);

  return [
    { label: 'Today', start: todayKey, end: todayKey },
    { label: 'Yesterday', start: shiftDateKey(todayKey, -1), end: shiftDateKey(todayKey, -1) },
    { label: 'Last 7 Days', start: shiftDateKey(todayKey, -6), end: todayKey },
    { label: 'Last 14 Days', start: shiftDateKey(todayKey, -13), end: todayKey },
    { label: 'Last 30 Days', start: shiftDateKey(todayKey, -29), end: todayKey },
    {
      label: 'This Week',
      start: formatDateKey(startOfWeek(now, { weekStartsOn: 1 })),
      end: formatDateKey(endOfWeek(now, { weekStartsOn: 1 })),
    },
    {
      label: 'Last Week',
      start: formatDateKey(startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })),
      end: formatDateKey(endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })),
    },
    {
      label: 'This Month',
      start: formatDateKey(startOfMonth(now)),
      end: formatDateKey(endOfMonth(now)),
    },
    {
      label: 'Last Month',
      start: formatDateKey(startOfMonth(subMonths(now, 1))),
      end: formatDateKey(endOfMonth(subMonths(now, 1))),
    },
  ];
};
