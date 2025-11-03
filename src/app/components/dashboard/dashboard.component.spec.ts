import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { of } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { EventsService } from '../calendar/events.service';
import { CalendarEvent } from '../calendar/calendar.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const mockEvents: CalendarEvent[] = [
    {
      title: 'Class A',
      type: 'კლასი',
      start: new Date(),
      backgroundColor: '#60a5fa',
      recurrence: 'none',
    },
    {
      title: 'Task A',
      type: 'დავალება',
      start: new Date(),
      backgroundColor: '#34d399',
    },
    {
      title: 'Exam A',
      type: 'გამოცდა',
      start: new Date(),
      backgroundColor: '#f87171',
    },
  ];

  const authServiceStub = {
    userProfile$: of({ firstName: 'ელენე' }),
  };

  const eventsServiceStub = {
    getUserEvents: jasmine
      .createSpy()
      .and.returnValue(Promise.resolve(mockEvents)),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: EventsService, useValue: eventsServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load events and update counts on init', async () => {
    eventsServiceStub.getUserEvents.and.returnValue(
      Promise.resolve(mockEvents)
    );

    await component.ngOnInit();

    expect(component.classCount).toBeGreaterThan(0);
    expect(component.taskCount).toBe(1);
    expect(component.examCount).toBe(1);
  });

  it('should filter only upcoming events', () => {
    component.events = [
      {
        title: 'Past Event',
        type: 'კლასი',
        start: new Date('2000-01-01'),
        backgroundColor: '#000',
      },
      {
        title: 'Future Event',
        type: 'დავალება',
        start: new Date(Date.now() + 86400000),
        backgroundColor: '#000',
      },
    ];

    component['setEventSummaries']();

    expect(component.upcomingEvents.length).toBe(1);
  });

  it('should compute weekly stats correctly for class/task/exam', () => {
    component.events = [...mockEvents];
    component['updateWeeklyStats']();

    const classData = component.barChartData.datasets[0].data;
    const taskData = component.barChartData.datasets[1].data;
    const examData = component.barChartData.datasets[2].data;

    expect(classData.reduce((a: any, b) => a + b, 0)).toBe(1);
    expect(taskData.reduce((a: any, b) => a + b, 0)).toBe(1);
    expect(examData.reduce((a: any, b) => a + b, 0)).toBe(1);
  });

  it('should handle weekly recurring class', () => {
    const now = new Date('2023-10-30T00:00:00');
    jasmine.clock().install();
    jasmine.clock().mockDate(now);

    const recurringClass: CalendarEvent = {
      title: 'Weekly Math',
      type: 'კლასი',
      start: new Date('2023-10-01'),
      backgroundColor: '#000',
      recurrence: 'weekly',
      weekDays: ['monday', 'wednesday'],
      rrule: {
        freq: 'weekly',
        interval: 1,
        byweekday: ['monday', 'wednesday'],
        dtstart: '2023-10-01',
        until: '2023-12-01',
      },
    };

    component.events = [recurringClass];
    component['updateWeeklyStats']();

    const classes = component.barChartData.datasets[0].data;

    expect(classes[0]).toBe(1);
    expect(classes[2]).toBe(1);

    jasmine.clock().uninstall();
  });

  it('should return true for same day dates', () => {
    const d1 = new Date('2023-10-31');
    const d2 = new Date('2023-10-31');
    expect(component['isSameDay'](d1, d2)).toBeTrue();
  });

  it('should return correct start of week (Monday)', () => {
    const date = new Date('2023-10-25'); // Wednesday
    const startOfWeek = component['getStartOfWeek'](date);
    expect(startOfWeek.getDay()).toBe(1); // Monday
  });

  it('should return correct weekday index', () => {
    expect(component['getWeekIndex'](new Date('2023-10-30'))).toBe(0); // Monday
    expect(component['getWeekIndex'](new Date('2023-11-01'))).toBe(2); // Wednesday
  });

  it('should return true if date is within the week', () => {
    const start = new Date('2023-10-30');
    const end = new Date('2023-11-06');
    const date = new Date('2023-11-01');
    expect(component['isInWeek'](date, start, end)).toBeTrue();
  });

  it('should return correct weekday date from week start', () => {
    const start = new Date('2023-10-30'); // Monday
    const wednesday = component['dateForWeekdayInWeek'](start, 2);
    expect(wednesday.getDay()).toBe(3); // Wednesday
  });

  it('should return correct index from weekday name', () => {
    expect(component['getDayIndexFromName']('monday')).toBe(0);
    expect(component['getDayIndexFromName']('sunday')).toBe(6);
  });
});
