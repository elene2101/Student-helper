import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Observable, Subject, map, takeUntil } from 'rxjs';
import { SubjectsService } from '../classes/subjects/subject.service';
import { ExamsService } from './exams.service';
import { AddExamComponent } from './add-exam/add-exam.component';
import { Exam, LocationType } from './exams.model';

@Component({
  selector: 'app-exams',
  standalone: true,
  templateUrl: './exams.component.html',
  styleUrls: ['./exams.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTabsModule,
    AddExamComponent,
  ],
})
export class ExamsComponent implements OnInit, OnDestroy {
  private readonly examsService = inject(ExamsService);
  private readonly subjectsService = inject(SubjectsService);

  private readonly destroy$ = new Subject<void>();

  public subjects$ = this.subjectsService.getSubjects$();
  public exams$ = this.examsService.getExams$();
  public upcomingExams$!: Observable<Exam[]>;
  public completedExams$!: Observable<Exam[]>;

  public showAddExam = false;
  public selectedExam: Exam | null = null;
  public locationType = LocationType;

  ngOnInit() {
    const today = new Date();

    this.upcomingExams$ = this.exams$.pipe(
      map((exams) => exams.filter((e) => new Date(e.date) >= today)),
      takeUntil(this.destroy$)
    );

    this.completedExams$ = this.exams$.pipe(
      map((exams) => exams.filter((e) => new Date(e.date) < today)),
      takeUntil(this.destroy$)
    );
  }

  public deleteExam(exam: Exam) {
    this.examsService.deleteExam(exam.id!);
  }

  public openAddExamComponent(exam: Exam | null): void {
    this.selectedExam = exam;
    this.showAddExam = true;
  }

  public closeExamAdd(): void {
    this.selectedExam = null;
    this.showAddExam = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.selectedExam = null;
    this.showAddExam = false;
  }
}
