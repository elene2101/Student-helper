import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarComponent } from './calendar.component';
import { EventsService } from './events.service';
import { MatDialog } from '@angular/material/dialog';
import { CalendarEvent } from '../calendar/calendar.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EventDetailsDialogComponent } from './event-details-dialog/event-details-dialog.component';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'full-calendar',
  template: '',
})
class MockFullCalendarComponent {
  @Input() options: any;
}

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;

  const mockEvents: CalendarEvent[] = [
    {
      title: 'Class A',
      type: 'კლასი',
      start: new Date('2023-10-30T10:00:00'),
      end: new Date('2023-10-30T11:00:00'),
      backgroundColor: '#60a5fa',
      location: 'Room 101',
      room: '101',
      mode: 'offline',
      description: 'Math class',
    },
    {
      title: 'Recurring Task',
      type: 'დავალება',
      start: new Date('2023-10-31T09:00:00'),
      backgroundColor: '#34d399',
      duration: '01:00',
      rrule: {
        freq: 'weekly',
        interval: 1,
        byweekday: ['tuesday'],
        dtstart: '2023-10-31T09:00:00',
        until: '2023-12-01',
      },
    },
  ];

  const eventsServiceStub = {
    getUserEvents: jasmine
      .createSpy()
      .and.returnValue(Promise.resolve(mockEvents)),
  };

  const matDialogStub = {
    open: jasmine.createSpy('open'),
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [CalendarComponent, MockFullCalendarComponent],
      providers: [
        { provide: EventsService, useValue: eventsServiceStub },
        { provide: MatDialog, useValue: matDialogStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    try {
      fixture?.destroy();
    } catch (e) {
      console.warn('Fixture destroy failed:', e);
    }
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set calendarOptions.plugins correctly', () => {
    const plugins = component.calendarOptions.plugins;
    expect(Array.isArray(plugins)).toBeTrue();
    expect(plugins?.length).toBeGreaterThan(0);
  });

  it('should open dialog with event data when event is clicked', () => {
    const fakeEventInfo = {
      event: {
        title: 'Test Event',
        start: new Date('2023-10-30T10:00:00'),
        end: new Date('2023-10-30T11:00:00'),
        extendedProps: {
          type: 'დავალება',
          location: 'Room A',
          room: 'A1',
          mode: 'online',
          description: 'Description here',
        },
      },
    };

    component.handleEventClick(fakeEventInfo);

    expect(matDialogStub.open).toHaveBeenCalledWith(
      EventDetailsDialogComponent,
      {
        data: {
          title: 'Test Event',
          type: 'დავალება',
          start: new Date('2023-10-30T10:00:00'),
          end: new Date('2023-10-30T11:00:00'),
          location: 'Room A',
          room: 'A1',
          mode: 'online',
          description: 'Description here',
        },
        width: '400px',
        disableClose: false,
      }
    );
  });

  it('should handle empty event list gracefully', async () => {
    eventsServiceStub.getUserEvents.and.returnValue(Promise.resolve([]));
    await component.ngOnInit();

    expect(component.calendarOptions.events).toEqual([]);
  });
});
