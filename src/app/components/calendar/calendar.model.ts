export type EventType = 'დავალება' | 'გამოცდა' | 'კლასი';

export interface CalendarEvent {
  title: string;
  type: EventType;
  start: Date;
  end?: Date;
  backgroundColor: string;

  duration?: string;
  location?: string;
  room?: string;
  recurrence?: string;
  weekDays?: string[];
  mode?: string;

  rrule?: {
    freq: 'weekly';
    interval: number;
    byweekday: string[];
    dtstart: string;
    until?: string;
  };
}
