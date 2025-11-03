export function combineDateAndTime(date: Date, time: Date): Date {
  const merged = new Date(date);
  merged.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), 0);
  return merged;
}

export function toLocalISOString(date: Date): string {
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localTime = new Date(date.getTime() - tzOffset);
  return localTime.toISOString().slice(0, 19);
}

export function buildRRule(
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly',
  startDate: Date,
  endDate: Date,
  weekDays?: string[]
) {
  if (recurrence === 'none') return undefined;

  const rule: any = {
    freq:
      recurrence === 'daily'
        ? 'daily'
        : recurrence === 'weekly'
        ? 'weekly'
        : 'monthly',
    interval: 1,
    dtstart: toLocalISOString(startDate),
    until: toLocalISOString(endDate),
  };

  if (recurrence === 'weekly' && weekDays?.length) {
    rule.byweekday = weekDays.map((day) => rruleWeekdaysMap[day.toLowerCase()]);
  }

  return rule;
}

const rruleWeekdaysMap: Record<string, string> = {
  monday: 'MO',
  tuesday: 'TU',
  wednesday: 'WE',
  thursday: 'TH',
  friday: 'FR',
  saturday: 'SA',
  sunday: 'SU',
};
