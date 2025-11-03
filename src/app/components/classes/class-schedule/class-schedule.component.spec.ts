import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { ClassScheduleComponent } from './class-schedule.component';
import { ClassScheduleService } from '../classes.service';
import { SubjectsService } from '../subjects/subject.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ClassSchedule, Subject } from '../classes.model';
import { provideNativeDateAdapter } from '@angular/material/core';

// ---------- Mocks ----------
const mockSubjects: Subject[] = [
  { id: '1', name: 'Math', isPublic: false },
  { id: '2', name: 'Physics', isPublic: true },
];

const mockSchedule: ClassSchedule = {
  id: '1',
  userId: 'u1',
  subject: { id: '1', name: 'Math' },
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-02'),
  startTime: new Date('2025-01-01T09:00:00'),
  endTime: new Date('2025-01-01T10:00:00'),
  recurrence: 'weekly',
  weekDays: ['monday', 'wednesday'],
  mode: 'online',
};

// ---------- Stubs ----------
const scheduleServiceStub = {
  getSchedules$: jasmine
    .createSpy('getSchedules$')
    .and.returnValue(of([mockSchedule])),
  addSchedule: jasmine
    .createSpy('addSchedule')
    .and.returnValue(Promise.resolve()),
  updateSchedule: jasmine
    .createSpy('updateSchedule')
    .and.returnValue(Promise.resolve()),
  checkDuplicateActiveSchedule: jasmine
    .createSpy('checkDuplicateActiveSchedule')
    .and.returnValue(of(false)),
};

const subjectsServiceStub = {
  getSubjects$: jasmine
    .createSpy('getSubjects$')
    .and.returnValue(of(mockSubjects)),
};

const toastrStub = {
  error: jasmine.createSpy('error'),
};

const dialogRefStub = {
  close: jasmine.createSpy('close'),
};

describe('ClassScheduleComponent', () => {
  let component: ClassScheduleComponent;
  let fixture: ComponentFixture<ClassScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassScheduleComponent, ReactiveFormsModule],
      providers: [
        provideNativeDateAdapter(),
        { provide: ClassScheduleService, useValue: scheduleServiceStub },
        { provide: SubjectsService, useValue: subjectsServiceStub },
        { provide: ToastrService, useValue: toastrStub },
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: null },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize subjects and schedules streams', (done) => {
    component.ngOnInit();
    component.subjects$.subscribe((subjects) => {
      expect(subjects.length).toBe(2);
      expect(subjects[0].name).toBe('Math');
    });
    component.schedules$.subscribe((schedules) => {
      expect(schedules.length).toBe(1);
      expect(schedules[0].subject.name).toBe('Math');
      done();
    });
  });

  it('should add and remove weekDays correctly', () => {
    const eventAdd = { checked: true };
    const eventRemove = { checked: false };

    component.onDayToggle('monday', eventAdd);
    expect(component.weekDaysArray.value).toContain('monday');

    component.onDayToggle('monday', eventRemove);
    expect(component.weekDaysArray.value).not.toContain('monday');
  });

  it('should reset endDate if before startDate', () => {
    const start = new Date('2025-01-05');
    const end = new Date('2025-01-04');
    component.scheduleForm.patchValue({ endDate: end });
    component.onStartDateChange(start);
    expect(component.scheduleForm.get('endDate')?.value).toBeNull();
  });

  it('should reset startDate if after endDate', () => {
    const start = new Date('2025-01-10');
    const end = new Date('2025-01-09');
    component.scheduleForm.patchValue({ startDate: start });
    component.onEndDateChange(end);
    expect(component.scheduleForm.get('startDate')?.value).toBeNull();
  });

  it('should validate startBeforeEnd correctly', () => {
    const group = component.scheduleForm;
    group.patchValue({
      startTime: new Date('2025-01-01T10:00:00'),
      endTime: new Date('2025-01-01T09:00:00'),
    });
    expect(component.startBeforeEndValidator(group)).toEqual({
      startAfterEnd: true,
    });
  });

  it('should show toast if duplicate schedule exists', (done) => {
    scheduleServiceStub.checkDuplicateActiveSchedule.and.returnValue(of(true));

    component.scheduleForm.patchValue({
      subject: mockSubjects[0],
      startDate: new Date(),
      endDate: new Date(),
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      recurrence: 'none',
      mode: 'online',
    });

    component.saveSchedule();
    setTimeout(() => {
      expect(toastrStub.error).toHaveBeenCalledWith(
        'ამ საგანზე უკვე ხართ დარეგისტრილებული.'
      );
      done();
    }, 0);
  });

  it('should compare objects by id', () => {
    const a = { id: 1, name: 'X' };
    const b = { id: 1, name: 'X' };
    expect(component.compareById(a, b)).toBeTrue();
    expect(component.compareById(a, { id: 2, name: 'Y' })).toBeFalse();
  });

  it('should disable save button if form invalid', () => {
    component.scheduleForm.reset();
    fixture.detectChanges();
    const saveBtn = fixture.debugElement.query(
      By.css('button.primary-btn')
    ).nativeElement;
    expect(saveBtn.disabled).toBeTrue();
  });

  it('should call saveSchedule on button click when valid', async () => {
    spyOn(component, 'saveSchedule');
    component.scheduleForm.patchValue({
      subject: mockSubjects[0],
      startDate: new Date(),
      endDate: new Date(),
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      recurrence: 'none',
      mode: 'online',
    });
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button.primary-btn'));
    btn.nativeElement.click();

    expect(component.saveSchedule).toHaveBeenCalled();
  });
});
