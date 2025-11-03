import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AssignmentsComponent } from './assignments.component';
import { AssignmentsService } from './assignment.service';
import { SubjectsService } from '../classes/subjects/subject.service';
import { Assignment } from './assignments.model';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-add-assignment',
  template: '',
  standalone: true,
})
class MockAddAssignmentComponent {
  @Input() assignmentData: Assignment | null = null;
  @Output() closeAddAssignmentEvent = new EventEmitter<void>();
}

describe('AssignmentsComponent', () => {
  let component: AssignmentsComponent;
  let fixture: ComponentFixture<AssignmentsComponent>;

  const now = new Date();
  const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const future = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const mockAssignments: Assignment[] = [
    {
      id: '1',
      subject: { id: '101', name: 'Math' },
      description: 'Past assignment',
      deadline: past,
      deadlineTime: past,
      completed: true,
      type: 'დავალება',
    },
    {
      id: '2',
      subject: { id: '102', name: 'Physics' },
      description: 'Upcoming assignment',
      deadline: future,
      deadlineTime: future,
      completed: false,
      type: 'შეხსენება',
    },
  ];

  const assignmentsServiceStub = {
    getAssignments$: jasmine.createSpy().and.returnValue(of(mockAssignments)),
    updateAssignment: jasmine.createSpy('updateAssignment'),
    deleteAssignment: jasmine.createSpy('deleteAssignment'),
  };

  const subjectsServiceStub = {
    getSubjects$: jasmine.createSpy().and.returnValue(of([])),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentsComponent],
      providers: [
        { provide: AssignmentsService, useValue: assignmentsServiceStub },
        { provide: SubjectsService, useValue: subjectsServiceStub },
      ],
    })
      .overrideComponent(AssignmentsComponent, {
        remove: {
          imports: [],
        },
        add: { imports: [MockAddAssignmentComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AssignmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return only pending assignments', (done) => {
    component.pendingAssignments$.subscribe((pending) => {
      expect(pending.length).toBe(1);
      expect(pending[0].completed).toBeFalse();
      expect(pending[0].subject.name).toBe('Physics');
      done();
    });
  });

  it('should return only completed assignments', (done) => {
    component.completedAssignments$.subscribe((completed) => {
      expect(completed.length).toBe(1);
      expect(completed[0].completed).toBeTrue();
      expect(completed[0].subject.name).toBe('Math');
      done();
    });
  });

  it('should call updateAssignment with completed true', () => {
    const assignment = mockAssignments[1];
    component.markCompleted(assignment);
    expect(assignmentsServiceStub.updateAssignment).toHaveBeenCalledWith('2', {
      completed: true,
    });
  });

  it('should call updateAssignment with completed false', () => {
    const assignment = mockAssignments[0];
    component.markPending(assignment);
    expect(assignmentsServiceStub.updateAssignment).toHaveBeenCalledWith('1', {
      completed: false,
    });
  });

  it('should call deleteAssignment', () => {
    const assignment = mockAssignments[0];
    component.deleteAssignment(assignment);
    expect(assignmentsServiceStub.deleteAssignment).toHaveBeenCalledWith('1');
  });

  it('should open AddAssignmentComponent with selected assignment', () => {
    const assignment = mockAssignments[0];
    component.openaddAssignmentComponent(assignment);
    expect(component.selectedAssignment).toEqual(assignment);
    expect(component.showAddAssignment).toBeTrue();
  });

  it('should open AddAssignmentComponent for new assignment', () => {
    component.openaddAssignmentComponent(null);
    expect(component.selectedAssignment).toBeNull();
    expect(component.showAddAssignment).toBeTrue();
  });

  it('should close AddAssignmentComponent', () => {
    component.selectedAssignment = mockAssignments[0];
    component.showAddAssignment = true;
    component.closeAssignmentAdd();
    expect(component.selectedAssignment).toBeNull();
    expect(component.showAddAssignment).toBeFalse();
  });
});
