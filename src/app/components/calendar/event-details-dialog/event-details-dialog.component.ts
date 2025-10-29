import { Component, Inject, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CalendarEventDialogData } from '../calendar.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-event-details-dialog',
  imports: [DatePipe],
  templateUrl: './event-details-dialog.component.html',
  styleUrl: './event-details-dialog.component.scss',
})
export class EventDetailsDialogComponent {
  private dialogRef = inject(MatDialogRef);

  constructor(@Inject(MAT_DIALOG_DATA) public data: CalendarEventDialogData) {}

  close() {
    this.dialogRef.close();
  }
}
