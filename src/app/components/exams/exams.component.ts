import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Observable, map } from 'rxjs';
import { Subject } from '../classes/classes.model';
import { SubjectsService } from '../classes/subjects/subject.service';
import { ExamsService } from './exams.service';
import { AddExamComponent } from './add-exam/add-exam.component';
import { Exam, LocationType } from './exams.model';

@Component({
  selector: 'app-exams',
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
  standalone: true,
})
export class ExamsComponent {
  private examsService = inject(ExamsService);
  private subjectsService = inject(SubjectsService);

  public subjects$ = this.subjectsService.getSubjects$();
  public exams$ = this.examsService.getExams$();
  public upcomingExams$!: Observable<Exam[]>;
  public completedExams$!: Observable<Exam[]>;

  public showAddExam: boolean = false;
  public selectedExam: Exam | null = null;
  locationType = LocationType;

  ngOnInit() {
    const today = new Date();

    this.upcomingExams$ = this.exams$.pipe(
      map((exam) => exam.filter((e) => new Date(e.date) >= today))
    );
    this.completedExams$ = this.exams$.pipe(
      map((exam) => exam.filter((e) => new Date(e.date) < today))
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

  public deleteExam(exam: Exam) {
    this.examsService.deleteExam(exam.id!);
  }

  openAddExamComponent(exam: Exam | null) {
    this.selectedExam = exam;
    this.showAddExam = true;
  }

  closeExamAdd() {
    this.selectedExam = null;
    this.showAddExam = false;
  }
}
