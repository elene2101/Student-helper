import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';
import { EventsService } from './events.service';
import rrulePlugin from '@fullcalendar/rrule';
import timeGridPlugin from '@fullcalendar/timegrid';
import { MatDialog } from '@angular/material/dialog';
import { EventDetailsDialogComponent } from './event-details-dialog/event-details-dialog.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent {
  private eventsService = inject(EventsService);
  private dialog = inject(MatDialog);

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

  ngOnInit() {
    this.eventsService.getUserEvents().then((events) => {
      const formatted = events.map((e) => {
        const base = {
          title: e.title,
          backgroundColor: e.backgroundColor,
          extendedProps: {
            type: e.type,
            location: e.location,
            room: e.room,
            mode: e.mode,
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
          description: e.description,
        };
      });

      this.calendarOptions.events = formatted;
    });
  }

  public handleEventClick(info: any) {
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

    this.dialog.open(EventDetailsDialogComponent, {
      data,
      width: '400px',
      disableClose: false,
    });
  }
}
