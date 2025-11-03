import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddAssignmentComponent } from './add-assignment.component';
import { AssignmentsService } from '../assignment.service';
import { SubjectsService } from '../../classes/subjects/subject.service';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { Subject } from '../../classes/classes.model';
import { provideNativeDateAdapter } from '@angular/material/core';
import { By } from '@angular/platform-browser';

describe('AddAssignmentComponent', () => {
  let component: AddAssignmentComponent;
  let fixture: ComponentFixture<AddAssignmentComponent>;

  const mockSubjects: Subject[] = [
    { id: '1', name: 'Math', isPublic: false },
    { id: '2', name: 'Physics', isPublic: true },
  ];

  const mockAssignmentsService = {
    addAssignment: jasmine
      .createSpy('addAssignment')
      .and.returnValue(Promise.resolve()),
    updateAssignment: jasmine
      .createSpy('updateAssignment')
      .and.returnValue(Promise.resolve()),
  };

  const mockSubjectsService = {
    getSubjects$: jasmine.createSpy().and.returnValue(of(mockSubjects)),
  };

  const mockToast = {
    success: jasmine.createSpy('success'),
    error: jasmine.createSpy('error'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAssignmentComponent],
      providers: [
        provideNativeDateAdapter(),
        { provide: AssignmentsService, useValue: mockAssignmentsService },
        { provide: SubjectsService, useValue: mockSubjectsService },
        { provide: ToastrService, useValue: mockToast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize subjects$ and filteredSubjects$', (done) => {
    component.subjects$.subscribe((subjects) => {
      expect(subjects.length).toBe(2);
      expect(subjects[0].name).toBe('Math');
      done();
    });
  });

  it('should patch form when assignmentData changes', () => {
    const assignment = {
      id: '1',
      subject: { id: '1', name: 'Math' },
      description: 'Test',
      deadline: new Date(),
      deadlineTime: new Date(),
      completed: false,
      type: 'დავალება',
    };

    Object.defineProperty(component, 'assignmentData', {
      value: () => assignment,
      writable: true,
    });

    component.ngOnChanges({
      assignmentData: {
        currentValue: assignment,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    expect(component.assignmentForm.value.description).toBe('Test');
  });

  it('should call addAssignment when creating new assignment', async () => {
    component.assignmentForm.setValue({
      subject: { id: '1', name: 'Math' } as any,
      description: 'New Task',
      deadline: new Date(),
      deadlineTime: new Date(),
      type: 'დავალება',
    });
    component.saveSchedule();
    await fixture.whenStable();
    expect(mockAssignmentsService.addAssignment).toHaveBeenCalled();
    expect(mockToast.success).toHaveBeenCalledWith(
      'დავალება წარმატებით დაემატა'
    );
  });

  it('should call updateAssignment when editing existing assignment', async () => {
    const assignment = {
      id: '123',
      subject: { id: '1', name: 'Math' },
      description: 'Old task',
      deadline: new Date(),
      deadlineTime: new Date(),
      completed: false,
      type: 'შეხსენება',
    };

    Object.defineProperty(component, 'assignmentData', {
      value: () => assignment,
      writable: true,
    });

    component.assignmentForm.setValue({
      subject: { id: '1', name: 'Math' } as any,
      description: 'Updated task',
      deadline: new Date(),
      deadlineTime: new Date(),
      type: 'შეხსენება',
    });

    component.saveSchedule();
    await fixture.whenStable();

    expect(mockAssignmentsService.updateAssignment).toHaveBeenCalledWith(
      '123',
      jasmine.any(Object)
    );
    expect(mockToast.success).toHaveBeenCalledWith(
      'დავალება წარმატებით განახლდა'
    );
  });

  it('should emit closeAddAssignmentEvent on closeAddAssignment()', () => {
    spyOn(component.closeAddAssignmentEvent, 'emit');
    component.closeAddAssignment();
    expect(component.closeAddAssignmentEvent.emit).toHaveBeenCalled();
  });

  it('should correctly compare objects by id', () => {
    const o1 = { id: 1, name: 'A' };
    const o2 = { id: 1, name: 'B' };
    const o3 = { id: 2, name: 'C' };
    expect(component.compareById(o1, o2)).toBeTrue();
    expect(component.compareById(o1, o3)).toBeFalse();
  });

  it('should disable submit button when form invalid', () => {
    fixture.detectChanges();
    const submitButton = fixture.debugElement.query(
      By.css('button.primary-btn')
    ).nativeElement;
    expect(submitButton.disabled).toBeTrue();
  });
});
