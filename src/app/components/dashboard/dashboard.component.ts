import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { BarChartData, BarChartOptions } from './dashboard.model';
import { EventsService } from '../calendar/events.service';
import { AuthService } from '../../core/auth/auth.service';
import { CalendarEvent } from '../calendar/calendar.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly eventsService = inject(EventsService);
  private readonly authService = inject(AuthService);

  private readonly destroy$ = new Subject<void>();

  public userProfile$ = this.authService.userProfile$;
  public today = new Date();

  public events: CalendarEvent[] = [];
  public upcomingEvents: CalendarEvent[] = [];

  public classCount = 0;
  public taskCount = 0;
  public examCount = 0;

  public barChartData = BarChartData;
  public barChartOptions = BarChartOptions;

  async ngOnInit() {
    this.events = await this.eventsService.getUserEvents();
    this.setEventSummaries();
    this.updateWeeklyStats();
  }

  private setEventSummaries() {
    const now = new Date();

    this.upcomingEvents = this.events
      .filter((e) => {
        const start = new Date(e.start);
        const end = e.rrule?.until ? new Date(e.rrule?.until) : start;
        return start >= now || end >= now;
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 5);
  }

  private updateWeeklyStats(): void {
    const startOfWeek = this.getStartOfWeek(new Date());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const weekData = {
      classes: new Array(7).fill(0),
      tasks: new Array(7).fill(0),
      exams: new Array(7).fill(0),
    };

    for (const e of this.events) {
      if (e.type === 'კლასი') {
        const startDate = new Date(e.start);
        const endDate = e.rrule?.until
          ? new Date(e.rrule.until)
          : new Date(3000, 0, 1);
        const mode = e.recurrence || 'none';

        switch (mode) {
          case 'none': {
            if (this.isInWeek(startDate, startOfWeek, endOfWeek)) {
              const idx = this.getWeekIndex(startDate);
              weekData.classes[idx]++;
            }
            break;
          }

          case 'daily': {
            const current = new Date(startDate);
            const last = new Date(endDate);
            current.setHours(0, 0, 0, 0);
            last.setHours(0, 0, 0, 0);

            if (this.isSameDay(current, last)) {
              if (this.isInWeek(current, startOfWeek, endOfWeek)) {
                weekData.classes[this.getWeekIndex(current)]++;
              }
              break;
            }

            while (current <= last) {
              if (this.isInWeek(current, startOfWeek, endOfWeek)) {
                weekData.classes[this.getWeekIndex(current)]++;
              }
              current.setDate(current.getDate() + 1);
            }
            break;
          }

          case 'weekly': {
            const activeStart = startDate;
            const activeEnd = endDate;
            const days = e.weekDays ?? [];

            if (activeEnd >= startOfWeek && activeStart <= endOfWeek) {
              for (const day of days) {
                const idx = this.getDayIndexFromName(day);
                const weekdayDate = this.dateForWeekdayInWeek(startOfWeek, idx);
                if (weekdayDate >= activeStart && weekdayDate <= activeEnd) {
                  weekData.classes[idx]++;
                }
              }
            }
            break;
          }

          case 'monthly': {
            const d = new Date(startDate);
            while (d <= endDate) {
              if (this.isInWeek(d, startOfWeek, endOfWeek)) {
                weekData.classes[this.getWeekIndex(d)]++;
              }
              d.setMonth(d.getMonth() + 1);
            }
            break;
          }
        }
      } else if (e.type === 'დავალება' || e.type === 'გამოცდა') {
        const d = new Date(e.start);
        if (this.isInWeek(d, startOfWeek, endOfWeek)) {
          const idx = this.getWeekIndex(d);
          if (e.type === 'დავალება') weekData.tasks[idx]++;
          if (e.type === 'გამოცდა') weekData.exams[idx]++;
        }
      }
    }

    this.barChartData = {
      ...this.barChartData,
      datasets: [
        { ...this.barChartData.datasets[0], data: weekData.classes },
        { ...this.barChartData.datasets[1], data: weekData.tasks },
        { ...this.barChartData.datasets[2], data: weekData.exams },
      ],
    };

    this.classCount = weekData.classes.reduce((a, b) => a + b, 0);
    this.taskCount = weekData.tasks.reduce((a, b) => a + b, 0);
    this.examCount = weekData.exams.reduce((a, b) => a + b, 0);
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private dateForWeekdayInWeek(weekStart: Date, weekdayIndex: number): Date {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + weekdayIndex);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getStartOfWeek(date: Date): Date {
    const start = new Date(date);
    const day = start.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private getWeekIndex(date: Date): number {
    const day = date.getDay();
    return day === 0 ? 6 : day - 1;
  }

  private getDayIndexFromName(day: string): number {
    const map: Record<string, number> = {
      monday: 0,
      tuesday: 1,
      wednesday: 2,
      thursday: 3,
      friday: 4,
      saturday: 5,
      sunday: 6,
    };
    return map[day.toLowerCase()] ?? 0;
  }

  private isInWeek(date: Date, start: Date, end: Date): boolean {
    return date >= start && date < end;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.events = [];
    this.upcomingEvents = [];

    this.barChartData = { ...this.barChartData, datasets: [] };
  }
}
