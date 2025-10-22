import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';
import { EventsService } from './events.service';
import rrulePlugin from '@fullcalendar/rrule';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent {
  private eventsService = inject(EventsService);

  calendarOptions: CalendarOptions = {
    timeZone: 'local',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin],
    initialView: 'timeGridWeek',
    allDaySlot: false,
    slotMinTime: '00:00:00',
    slotMaxTime: '23:59:59',
    events: [],
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
        };
      });

      this.calendarOptions.events = formatted;
    });
  }
}
