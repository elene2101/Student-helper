import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Assignment } from './assignments.model';
import { AddAssignmentComponent } from './add-assignment/add-assignment.component';
import { Observable, map } from 'rxjs';
import { AssignmentsService } from './assignment.service';
import { MatCheckbox } from '@angular/material/checkbox';
import { SubjectsService } from '../classes/subjects/subject.service';

@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTabsModule,
    MatCheckbox,
    AddAssignmentComponent,
  ],
  standalone: true,
})
export class AssignmentsComponent {
  private assignmentsService = inject(AssignmentsService);
  private subjectsService = inject(SubjectsService);

  public subjects$ = this.subjectsService.getSubjects$();
  public assignments$ = this.assignmentsService.getAssignments$();

  public showAddAssignment: boolean = false;
  public selectedAssignment: null | Assignment = null;

  get pendingAssignments$(): Observable<Assignment[]> {
    return this.assignments$.pipe(
      map((a) =>
        a
          .filter((x) => !x.completed)
          .sort(
            (a, b) =>
              new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          )
      )
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
      )
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
}
