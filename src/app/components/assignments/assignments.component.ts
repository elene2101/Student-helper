import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckbox } from '@angular/material/checkbox';
import { Subject, Observable, map, takeUntil } from 'rxjs';
import { Assignment } from './assignments.model';
import { AddAssignmentComponent } from './add-assignment/add-assignment.component';
import { AssignmentsService } from './assignment.service';
import { SubjectsService } from '../classes/subjects/subject.service';

@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTabsModule,
    MatCheckbox,
    AddAssignmentComponent,
  ],
})
export class AssignmentsComponent implements OnDestroy {
  private assignmentsService = inject(AssignmentsService);
  private subjectsService = inject(SubjectsService);

  private readonly destroy$ = new Subject<void>();

  public subjects$ = this.subjectsService.getSubjects$();
  public assignments$ = this.assignmentsService.getAssignments$();

  public showAddAssignment = false;
  public selectedAssignment: Assignment | null = null;

  get pendingAssignments$(): Observable<Assignment[]> {
    return this.assignments$.pipe(
      map((a) =>
        a
          .filter((x) => !x.completed)
          .sort(
            (a, b) =>
              new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          )
      ),
      takeUntil(this.destroy$)
    );
  }

  get completedAssignments$(): Observable<Assignment[]> {
    return this.assignments$.pipe(
      map((a) =>
        a
          .filter((x) => x.completed)
          .sort(
            (a, b) =>
              new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          )
      ),
      takeUntil(this.destroy$)
    );
  }

  public markCompleted(assignment: Assignment) {
    this.assignmentsService.updateAssignment(assignment.id!, {
      completed: true,
    });
  }

  public markPending(assignment: Assignment) {
    this.assignmentsService.updateAssignment(assignment.id!, {
      completed: false,
    });
  }

  public deleteAssignment(assignment: Assignment) {
    this.assignmentsService.deleteAssignment(assignment.id!);
  }

  openaddAssignmentComponent(assignment: Assignment | null) {
    this.selectedAssignment = assignment;
    this.showAddAssignment = true;
  }

  closeAssignmentAdd() {
    this.selectedAssignment = null;
    this.showAddAssignment = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
