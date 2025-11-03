import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventDetailsDialogComponent } from './event-details-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('EventDetailsDialogComponent', () => {
  let component: EventDetailsDialogComponent;
  let fixture: ComponentFixture<EventDetailsDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<EventDetailsDialogComponent>>;

  const mockData = {
    title: 'Test Event',
    start: new Date('2023-11-03T10:00:00'),
    end: new Date('2023-11-03T11:00:00'),
    type: 'ლექცია',
    location: 'მთავარი შენობა',
    room: '101',
    mode: 'offline',
    description: 'ტესტ აღწერა',
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [EventDetailsDialogComponent],
      providers: [
        DatePipe,
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display event title', () => {
    const titleEl = fixture.debugElement.query(By.css('h2')).nativeElement;
    expect(titleEl.textContent).toContain(mockData.title);
  });

  it('should display formatted date range', () => {
    const dateEl = fixture.debugElement.query(
      By.css('.text-gray-400')
    ).nativeElement;
    expect(dateEl.textContent).toContain('23');
  });

  it('should display type, location, room, mode, and description', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain(mockData.type);
    expect(text).toContain(mockData.location);
    expect(text).toContain(mockData.room);
    expect(text).toContain(mockData.mode);
    expect(text).toContain(mockData.description);
  });

  it('should close dialog on button click', () => {
    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    button.click();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });
});
