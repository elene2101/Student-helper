import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, map, takeUntil } from 'rxjs';

import { ClassScheduleService } from './classes.service';
import { SubjectsService } from './subjects/subject.service';
import { ClassSchedule, WeekDays } from './classes.model';
import { SubjectsComponent } from './subjects/subjects.component';
import { ClassScheduleComponent } from './class-schedule/class-schedule.component';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    SubjectsComponent,
    CommonModule,
    MatIconModule,
    MatTabsModule,
  ],
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss'],
})
export class ClassesComponent implements OnInit, OnDestroy {
  private scheduleService = inject(ClassScheduleService);
  private subjectsService = inject(SubjectsService);
  private dialog = inject(MatDialog);
  private toast = inject(ToastrService);

  private readonly destroy$ = new Subject<void>();

  public schedules$!: Observable<ClassSchedule[]>;
  public upcomingSchedules$!: Observable<ClassSchedule[]>;
  public pastSchedules$!: Observable<ClassSchedule[]>;
  public subjects$ = this.subjectsService.getSubjects$();

  public weekDays = WeekDays;

  ngOnInit() {
    const today = new Date();

    this.schedules$ = this.scheduleService.getSchedules$();

    this.upcomingSchedules$ = this.schedules$.pipe(
      map((schedules) => schedules.filter((s) => new Date(s.endDate) >= today)),
      takeUntil(this.destroy$)
    );

    this.pastSchedules$ = this.schedules$.pipe(
      map((schedules) => schedules.filter((s) => new Date(s.endDate) < today)),
      takeUntil(this.destroy$)
    );
  }

  public deleteSchedule(id: string): void {
    try {
      this.scheduleService.deleteSchedule(id);
    } catch (err) {
      this.toast.error('კლასის წაშლა ვერ მოხერხდა');
      console.error('წაშლა ვერ მოხერხდა', err);
    }
  }

  getRecurrenceLabel(recurrence: string, weekDays: string[] = []): string {
    switch (recurrence) {
      case 'none':
        return 'ერთჯერადი';
      case 'daily':
        return 'ყოველდღე';
      case 'weekly':
        const labels = weekDays
          .map((dayKey) => this.weekDays.find((d) => d.key === dayKey)?.label)
          .filter(Boolean);
        return labels.join(', ');
      case 'monthly':
        return 'ყოველთვე';
      default:
        return '';
    }
  }

  public openScheduleComponent(schedule?: ClassSchedule): void {
    const dialogRef = this.dialog.open(ClassScheduleComponent, {
      width: '80%',
      maxWidth: '824px',
      height: '68vh',
      maxHeight: '98vh',
      disableClose: false,
      data: schedule,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
