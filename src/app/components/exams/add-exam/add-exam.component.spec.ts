import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddExamComponent } from './add-exam.component';
import { ExamsService } from '../exams.service';
import { SubjectsService } from '../../classes/subjects/subject.service';
import { ToastrService } from 'ngx-toastr';
import { provideNativeDateAdapter } from '@angular/material/core';
import { of, skip } from 'rxjs';
import { Exam, ExamType, LocationType } from '../exams.model';
import { Subject } from '../../classes/classes.model';
import { By } from '@angular/platform-browser';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'quill-editor',
  template: '',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockQuillEditorComponent),
      multi: true,
    },
  ],
})
class MockQuillEditorComponent implements ControlValueAccessor {
  @Input() modules: any;
  writeValue(): void {}
  registerOnChange(): void {}
  registerOnTouched(): void {}
}

describe('AddExamComponent', () => {
  let component: AddExamComponent;
  let fixture: ComponentFixture<AddExamComponent>;

  const mockSubjects: Subject[] = [
    { id: '1', name: 'Math', isPublic: true },
    { id: '2', name: 'Physics', isPublic: false },
  ];

  const mockExam: Exam = {
    id: '1',
    name: 'Math Final',
    subject: { id: '1', name: 'Math' },
    type: ExamType.Exam,
    location: LocationType.Campus,
    date: new Date(),
    time: new Date(),
    duration: 90,
    description: 'desc',
  };

  const examsServiceStub = {
    addExam: jasmine.createSpy('addExam').and.returnValue(Promise.resolve()),
    updateExam: jasmine
      .createSpy('updateExam')
      .and.returnValue(Promise.resolve()),
  };

  const subjectsServiceStub = {
    getSubjects$: () => of(mockSubjects),
  };

  const toastrStub = {
    success: jasmine.createSpy('success'),
    error: jasmine.createSpy('error'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddExamComponent],
      providers: [
        { provide: ExamsService, useValue: examsServiceStub },
        { provide: SubjectsService, useValue: subjectsServiceStub },
        { provide: ToastrService, useValue: toastrStub },
        provideNativeDateAdapter(),
      ],
    })
      .overrideComponent(AddExamComponent, {
        remove: { imports: [QuillModule] },
        add: { imports: [MockQuillEditorComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AddExamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load filtered subjects', (done) => {
    component.ngOnInit();
    fixture.detectChanges();

    component.filteredSubjects$.pipe(skip(1)).subscribe((result) => {
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Math');
      done();
    });

    component.subjectFilterCtrl.setValue('math');
  });

  it('should require room when location is campus', () => {
    component.examForm.get('location')?.setValue(LocationType.Campus);

    const room = component.examForm.get('room');
    expect(room?.validator).toBeTruthy();
  });

  it('should reset room when online selected', () => {
    component.examForm.get('location')?.setValue(LocationType.Campus);
    component.examForm.get('location')?.setValue(LocationType.Online);

    const room = component.examForm.get('room');
    expect(room?.value).toBe('');
  });

  it('should patch form when examData passed', () => {
    (component as any).examData = () => mockExam;
    component.ngOnChanges({
      examData: {
        currentValue: mockExam,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    expect(component.examForm.value.name).toBe('Math Final');
  });

  it('should reset form when examData null', () => {
    component.examForm.patchValue({ name: 'Old' });
    (component as any).examData = () => null;

    component.ngOnChanges({
      examData: {
        currentValue: null,
        previousValue: mockExam,
        firstChange: false,
        isFirstChange: () => false,
      },
    });

    expect(component.examForm.value.name).toBeFalsy();
  });

  it('should add exam when no existing id', async () => {
    component.examForm.setValue({
      name: 'Exam',
      subject: '1',
      type: ExamType.Quiz,
      location: LocationType.Online,
      room: '',
      date: new Date(),
      time: '10:00',
      duration: '45',
      description: 'desc',
    });

    await component.saveExam();

    expect(examsServiceStub.addExam).toHaveBeenCalled();
    expect(toastrStub.success).toHaveBeenCalled();
  });

  it('should emit close event', () => {
    spyOn(component.closeAddExamEvent, 'emit');
    component.closeExamAdd();
    expect(component.closeAddExamEvent.emit).toHaveBeenCalled();
  });

  it('should disable submit button when invalid', () => {
    const btn = fixture.debugElement.query(
      By.css('button[type="submit"]')
    ).nativeElement;
    expect(btn.disabled).toBeTrue();
  });
});
