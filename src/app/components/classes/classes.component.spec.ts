import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassesComponent } from './classes.component';
import { ClassScheduleService } from './classes.service';
import { SubjectsService } from './subjects/subject.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { Component, Input } from '@angular/core';
import { ClassSchedule, Subject } from './classes.model';
import { DatePipe } from '@angular/common';
import { ClassScheduleComponent } from './class-schedule/class-schedule.component';
import { SubjectsComponent } from './subjects/subjects.component';

@Component({
  selector: 'app-subjects',
  template: '',
  standalone: true,
})
class MockSubjectsComponent {
  @Input() data: any;
}

@Component({
  selector: 'app-class-schedule',
  template: '',
  standalone: true,
})
class MockClassScheduleComponent {}

describe('ClassesComponent', () => {
  let component: ClassesComponent;
  let fixture: ComponentFixture<ClassesComponent>;

  const today = new Date();
  const twoDaysAgo = new Date(today.getTime() - 2 * 86400000);
  const twoDaysLater = new Date(today.getTime() + 2 * 86400000);

  const mockSchedules: ClassSchedule[] = [
    {
      id: '1',
      userId: 'user1',
      subject: { id: '1', name: 'Math' },
      startDate: twoDaysAgo,
      endDate: twoDaysAgo,
      startTime: twoDaysAgo,
      endTime: twoDaysAgo,
      recurrence: 'weekly',
      weekDays: ['monday', 'wednesday'],
      mode: 'campus',
    },
    {
      id: '2',
      userId: 'user2',
      subject: { id: '2', name: 'Physics' },
      startDate: twoDaysLater,
      endDate: twoDaysLater,
      startTime: twoDaysLater,
      endTime: twoDaysLater,
      recurrence: 'daily',
      weekDays: [],
      mode: 'online',
    },
  ];

  const mockSubjects: Subject[] = [
    { id: '1', name: 'Math', isPublic: true },
    { id: '2', name: 'Physics', isPublic: false },
  ];

  const scheduleServiceStub = {
    getSchedules$: () => of(mockSchedules),
    deleteSchedule: jasmine.createSpy('deleteSchedule'),
  };

  const subjectsServiceStub = {
    getSubjects$: () => of(mockSubjects),
  };

  const toastrStub = {
    success: jasmine.createSpy('success'),
    error: jasmine.createSpy('error'),
  };

  const dialogStub = {
    open: jasmine.createSpy('open'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassesComponent],
      providers: [
        { provide: ClassScheduleService, useValue: scheduleServiceStub },
        { provide: SubjectsService, useValue: subjectsServiceStub },
        { provide: ToastrService, useValue: toastrStub },
        { provide: MatDialog, useValue: dialogStub },
        DatePipe,
      ],
    })
      .overrideComponent(ClassesComponent, {
        remove: {
          imports: [SubjectsComponent, ClassScheduleComponent],
        },
        add: {
          imports: [MockSubjectsComponent, MockClassScheduleComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should split schedules into upcoming and past', (done) => {
    component.ngOnInit();

    component.upcomingSchedules$.subscribe((upcoming) => {
      expect(upcoming.length).toBe(1);
      expect(upcoming[0].subject.name).toBe('Physics');
    });

    component.pastSchedules$.subscribe((past) => {
      expect(past.length).toBe(1);
      expect(past[0].subject.name).toBe('Math');
      done();
    });
  });

  it('should call deleteSchedule on service', () => {
    component.deleteSchedule('1');
    expect(scheduleServiceStub.deleteSchedule).toHaveBeenCalledWith('1');
  });

  it('should handle deleteSchedule error gracefully', () => {
    const errSpy = spyOn(console, 'error');
    (scheduleServiceStub.deleteSchedule as jasmine.Spy).and.throwError('fail');
    component.deleteSchedule('123');
    expect(toastrStub.error).toHaveBeenCalledWith('კლასის წაშლა ვერ მოხერხდა');
    expect(errSpy).toHaveBeenCalled();
  });

  it('should return correct recurrence labels', () => {
    const weeklyLabel = component.getRecurrenceLabel('weekly', ['monday']);
    expect(weeklyLabel).toContain('ორშაბათი');

    const dailyLabel = component.getRecurrenceLabel('daily');
    expect(dailyLabel).toBe('ყოველდღე');

    const monthlyLabel = component.getRecurrenceLabel('monthly');
    expect(monthlyLabel).toBe('ყოველთვე');

    const noneLabel = component.getRecurrenceLabel('none');
    expect(noneLabel).toBe('ერთჯერადი');

    const defaultLabel = component.getRecurrenceLabel('something-else');
    expect(defaultLabel).toBe('');
  });

  it('should open schedule dialog with correct data', () => {
    const schedule = mockSchedules[0];
    component.openScheduleComponent(schedule);
    expect(dialogStub.open).toHaveBeenCalled();
    const args = dialogStub.open.calls.mostRecent().args[1];
    expect(args.data).toEqual(schedule);
  });

  it('should open empty schedule dialog when no data passed', () => {
    component.openScheduleComponent();
    expect(dialogStub.open).toHaveBeenCalled();
    const args = dialogStub.open.calls.mostRecent().args[1];
    expect(args.data).toBeUndefined();
  });

  it('should render upcoming and past classes in template', async () => {
    component.ngOnInit();
    fixture.detectChanges();

    const items = fixture.debugElement.queryAll(By.css('li'));
    expect(items.length).toBeGreaterThan(0);

    const addButton = fixture.debugElement.query(By.css('button.primary-btn'));
    expect(addButton).toBeTruthy();
  });

  it('should call deleteSchedule when delete button clicked', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const deleteButtons = fixture.debugElement.queryAll(By.css('.delete-btn'));
    if (deleteButtons.length > 0) {
      deleteButtons[0].nativeElement.click();
      expect(scheduleServiceStub.deleteSchedule).toHaveBeenCalled();
    }
  });

  it('should call openScheduleComponent when edit button clicked', () => {
    spyOn(component, 'openScheduleComponent');
    component.ngOnInit();
    fixture.detectChanges();

    const editButtons = fixture.debugElement.queryAll(By.css('.edit-btn'));
    if (editButtons.length > 0) {
      editButtons[0].nativeElement.click();
      expect(component.openScheduleComponent).toHaveBeenCalled();
    }
  });
});
