export interface ClassSchedule {
  id?: string;
  userId: string;
  subjectId: string;
  startDate: Date;
  endDate: Date;
  startTime: Date;
  endTime: Date;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  weekDays?: string[];
  mode: 'online' | 'campus';
}

export const WeekDays = [
  { key: 'monday', label: 'ორშაბათი' },
  { key: 'tuesday', label: 'სამშაბათი' },
  { key: 'wednesday', label: 'ოთხშაბათი' },
  { key: 'thursday', label: 'ხუთშაბათი' },
  { key: 'friday', label: 'პარასკევი' },
  { key: 'saturday', label: 'შაბათი' },
  { key: 'sunday', label: 'კვირა' },
];
