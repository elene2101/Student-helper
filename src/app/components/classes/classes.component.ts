import { Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { ClassScheduleService } from './classes.service';
import { Observable, map } from 'rxjs';
import { ClassSchedule, Subject, WeekDays } from './classes.model';
import { SubjectsComponent } from './subjects/subjects.component';
import { ClassScheduleComponent } from './class-schedule/class-schedule.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ToastrService } from 'ngx-toastr';
import { SubjectsService } from './subjects/subject.service';

@Component({
  selector: 'app-classes',
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
  standalone: true,
})
export class ClassesComponent {
  private scheduleService = inject(ClassScheduleService);
  private subjectsService = inject(SubjectsService);
  private dialog = inject(MatDialog);
  private toast = inject(ToastrService);

  public schedules$!: Observable<ClassSchedule[]>;
  public upcomingSchedules$!: Observable<ClassSchedule[]>;
  public pastSchedules$!: Observable<ClassSchedule[]>;
  public subjects$ = this.subjectsService.getSubjects$();
  public weekDays = WeekDays;

  ngOnInit() {
    this.schedules$ = this.scheduleService.getSchedules$();

    const today = new Date();

    this.upcomingSchedules$ = this.schedules$.pipe(
      map((schedules) => schedules.filter((s) => new Date(s.endDate) >= today))
    );

    this.pastSchedules$ = this.schedules$.pipe(
      map((schedules) => schedules.filter((s) => new Date(s.endDate) < today))
    );
  }

  public getSubjectName(
    subjectId: string,
    subjects: Subject[] | null | undefined
  ): string {
    if (!subjects) return 'უცნობი საგანი';
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? subject.name : 'უცნობი საგანი';
  }

  public deleteSchedule(id: string) {
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

  public openScheduleComponent(schedule?: ClassSchedule) {
    this.dialog.open(ClassScheduleComponent, {
      width: '80%',
      maxWidth: '824px',
      height: '68vh',
      maxHeight: '98vh',
      disableClose: false,
      data: schedule,
    });
  }
}
