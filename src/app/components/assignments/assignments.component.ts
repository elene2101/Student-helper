import { Component, inject, NgModule, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Assignment, AssignmentService } from './assignment.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class AssignmentsComponent implements OnInit {
  assignmentService = inject(AssignmentService);
  assignments$!: Observable<Assignment[]> | any;
  newAssignment: Partial<Assignment> = {
    subject: '',
    description: '',
    deadline: '',
  };

  ngOnInit() {
    this.assignments$ = this.assignmentService.getAssignments(
      'DyELadOE0MYsabHOFgBcBLchN2a2'
    );
  }

  addAssignment() {
    if (this.newAssignment.subject && this.newAssignment.deadline) {
      this.assignmentService.addAssignment(this.newAssignment as Assignment);
      this.newAssignment = { subject: '', description: '', deadline: '' };
    }
  }

  toggleComplete(assignment: Assignment) {
    this.assignmentService.updateAssignment(assignment.id!, {
      completed: !assignment.completed,
    });
  }

  deleteAssignment(id: string) {
    this.assignmentService.deleteAssignment(id);
  }
}
