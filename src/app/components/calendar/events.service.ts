import { inject, Injectable } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import {
  buildRRule,
  combineDateAndTime,
  toLocalISOString,
} from '../../share/helper';
import { CalendarEvent } from './calendar.model';

function getDurationString(startTime: Date, endTime: Date): string {
  const minutes =
    endTime.getHours() * 60 +
    endTime.getMinutes() -
    (startTime.getHours() * 60 + startTime.getMinutes());
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins
    .toString()
    .padStart(2, '0')}`;
}

@Injectable({ providedIn: 'root' })
export class EventsService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  async getUserEvents(): Promise<CalendarEvent[]> {
    const user = await this.waitForAuthUser();

    const tasksRef = collection(this.firestore, 'assignments');
    const examsRef = collection(this.firestore, 'exams');
    const classesRef = collection(this.firestore, 'schedules');

    const taskQuery = query(tasksRef, where('userId', '==', user.uid));
    const examQuery = query(examsRef, where('userId', '==', user.uid));
    const classQuery = query(classesRef, where('userId', '==', user.uid));

    const [taskSnap, examSnap, classSnap] = await Promise.all([
      getDocs(taskQuery),
      getDocs(examQuery),
      getDocs(classQuery),
    ]);

    const tasks: CalendarEvent[] = taskSnap.docs
      .map((doc) => {
        const data: any = doc.data();
        if (data.completed) return null;

        const dueDate = data.deadline?.toDate();
        const dueTime = data.deadlineTime?.toDate();
        const start = combineDateAndTime(dueDate, dueTime);

        return {
          title: data.subject?.name ?? 'Untitled',
          type: 'დავალება',
          start,
          backgroundColor: '#007bff',
        };
      })
      .filter(Boolean) as CalendarEvent[];

    const exams: CalendarEvent[] = examSnap.docs.map((doc) => {
      const data: any = doc.data();
      const examDate = data.date?.toDate();
      const examTime = data.time?.toDate();
      const start = combineDateAndTime(examDate, examTime);

      const end = new Date(start);
      if (data.duration) end.setMinutes(end.getMinutes() + data.duration);

      return {
        title: `${data.subject?.name ?? ''} - ${data.name}`,
        type: 'გამოცდა',
        start,
        end,
        backgroundColor: '#ff9800',
        duration: data.duration,
        location: data.location,
        room: data.room,
      };
    });

    const classes: CalendarEvent[] = classSnap.docs.map((doc) => {
      const data: any = doc.data();

      const startDate = data.startDate?.toDate();
      const endDate = data.endDate?.toDate();
      const startTime = data.startTime?.toDate();
      const endTime = data.endTime?.toDate();

      const start = combineDateAndTime(startDate, startTime);
      const end = combineDateAndTime(startDate, endTime);
      const duration = getDurationString(startTime, endTime);

      const rrule = buildRRule(
        data.recurrence,
        startDate,
        endDate,
        data.weekDays
      );

      return {
        title: data.subject?.name ?? 'Unnamed Subject',
        type: 'კლასი',
        start,
        end,
        backgroundColor: '#4caf50',
        recurrence: data.recurrence,
        weekDays: data.weekDays,
        mode: data.mode,
        ...(rrule ? { rrule, duration } : {}),
      };
    });

    return [...tasks, ...exams, ...classes];
  }

  private waitForAuthUser(): Promise<import('firebase/auth').User> {
    return new Promise((resolve, reject) => {
      const unsub = onAuthStateChanged(this.auth, (user) => {
        unsub();
        if (user) resolve(user);
        else reject(new Error('User not logged in'));
      });
    });
  }
}
