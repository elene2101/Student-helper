import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import rrulePlugin from '@fullcalendar/rrule';
import { CalendarOptions } from '@fullcalendar/core';
import { EventsService } from './events.service';
import { MatDialog } from '@angular/material/dialog';
import { EventDetailsDialogComponent } from './event-details-dialog/event-details-dialog.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit, OnDestroy {
  private eventsService = inject(EventsService);
  private dialog = inject(MatDialog);

  private readonly destroy$ = new Subject<void>();
  private activeDialogRef: any = null;

  calendarOptions: CalendarOptions = {
    timeZone: 'local',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin],
    initialView: 'timeGridWeek',
    allDaySlot: false,
    slotMinTime: '00:00:00',
    slotMaxTime: '23:59:59',
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: '',
      right: 'timeGridWeek,timeGridDay',
    },
    eventClick: this.handleEventClick.bind(this),
  };

  ngOnInit(): void {
    this.loadEventsSafely();
  }

  private async loadEventsSafely() {
    try {
      const events = await this.eventsService.getUserEvents();
      if (this.destroy$.isStopped) return;

      const formatted = events.map((e) => {
        const base = {
          title: e.title,
          backgroundColor: e.backgroundColor,
          extendedProps: {
            type: e.type,
            location: e.location,
            room: e.room,
            mode: e.mode,
            description: e.description,
          },
        };

        if (e.rrule && e.duration) {
          return {
            ...base,
            rrule: e.rrule,
            duration: e.duration,
          };
        }

        return {
          ...base,
          start: e.start,
          end: e.end,
        };
      });

      this.calendarOptions = {
        ...this.calendarOptions,
        events: formatted,
      };
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }

  public handleEventClick(info: any): void {
    const event = info.event;
    const data = {
      title: event.title,
      type: event.extendedProps.type,
      start: event.start,
      end: event.end,
      location: event.extendedProps.location,
      room: event.extendedProps.room,
      mode: event.extendedProps.mode,
      description: event.extendedProps.description,
    };

    this.activeDialogRef = this.dialog.open(EventDetailsDialogComponent, {
      data,
      width: '400px',
      disableClose: false,
    });

    this.activeDialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => (this.activeDialogRef = null));
  }

  ngOnDestroy(): void {
    if (this.activeDialogRef) {
      this.activeDialogRef.close();
      this.activeDialogRef = null;
    }

    this.destroy$.next();
    this.destroy$.complete();

    this.calendarOptions.events = [];
  }
}
