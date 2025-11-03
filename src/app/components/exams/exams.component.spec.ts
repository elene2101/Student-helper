import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExamsComponent } from './exams.component';
import { ExamsService } from './exams.service';
import { SubjectsService } from '../classes/subjects/subject.service';
import { of } from 'rxjs';
import { Exam, ExamType, LocationType } from './exams.model';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AddExamComponent } from './add-exam/add-exam.component';

@Component({
  selector: 'app-add-exam',
  template: '',
  standalone: true,
})
class MockAddExamComponent {
  @Input() examData: Exam | null = null;
  @Output() closeAddExamEvent = new EventEmitter<void>();
}

describe('ExamsComponent', () => {
  let component: ExamsComponent;
  let fixture: ComponentFixture<ExamsComponent>;

  const now = new Date();
  const pastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const futureDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  const mockExams: Exam[] = [
    {
      id: '1',
      name: 'Math Final',
      subject: { id: '101', name: 'Math' },
      type: ExamType.Exam,
      location: LocationType.Campus,
      date: pastDate,
      time: pastDate,
      duration: 90,
      description: 'Final math exam',
    },
    {
      id: '2',
      name: 'Physics Quiz',
      subject: { id: '102', name: 'Physics' },
      type: ExamType.Quiz,
      location: LocationType.Online,
      date: futureDate,
      time: futureDate,
      duration: 45,
      description: 'Weekly quiz on optics',
    },
  ];

  const examsServiceStub = {
    getExams$: () => of(mockExams),
    deleteExam: jasmine.createSpy('deleteExam'),
  };

  const subjectsServiceStub = {
    getSubjects$: () => of([]),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamsComponent],
      providers: [
        { provide: ExamsService, useValue: examsServiceStub },
        { provide: SubjectsService, useValue: subjectsServiceStub },
      ],
    })
      .overrideComponent(ExamsComponent, {
        remove: {
          imports: [AddExamComponent],
        },
        add: {
          imports: [MockAddExamComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ExamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should split exams into upcoming and completed', (done) => {
    component.upcomingExams$.subscribe((upcoming) => {
      expect(upcoming.length).toBe(1);
      expect(upcoming[0].name).toBe('Physics Quiz');
      expect(upcoming[0].location).toBe(LocationType.Online);
    });

    component.completedExams$.subscribe((completed) => {
      expect(completed.length).toBe(1);
      expect(completed[0].name).toBe('Math Final');
      expect(completed[0].location).toBe(LocationType.Campus);
      done();
    });
  });

  it('should call deleteExam when delete button is clicked', () => {
    fixture.detectChanges();

    const deleteButtons = fixture.debugElement.queryAll(By.css('.delete-btn'));
    deleteButtons[0].nativeElement.click();

    expect(examsServiceStub.deleteExam).toHaveBeenCalled();
    examsServiceStub.deleteExam.calls.mostRecent().args[0].toBeTruthy;
  });

  it('should open AddExamComponent when openAddExamComponent is called', () => {
    const examToEdit = mockExams[1];
    component.openAddExamComponent(examToEdit);
    fixture.detectChanges();

    const addExamComponent = fixture.debugElement.query(
      By.directive(MockAddExamComponent)
    );
    expect(addExamComponent).toBeTruthy();
    expect(component.showAddExam).toBeTrue();
    expect(component.selectedExam).toEqual(examToEdit);
  });

  it('should close AddExamComponent when closeExamAdd is called', () => {
    component.openAddExamComponent(mockExams[0]);
    fixture.detectChanges();

    component.closeExamAdd();
    fixture.detectChanges();

    const addExamComponent = fixture.debugElement.query(
      By.directive(MockAddExamComponent)
    );
    expect(addExamComponent).toBeNull();
    expect(component.showAddExam).toBeFalse();
    expect(component.selectedExam).toBeNull();
  });

  it('should open add exam form when clicking "Add Exam" button', () => {
    const addButton = fixture.debugElement.query(
      By.css('button.primary-btn')
    ).nativeElement;
    addButton.click();

    expect(component.showAddExam).toBeTrue();
    expect(component.selectedExam).toBeNull();
  });
});
