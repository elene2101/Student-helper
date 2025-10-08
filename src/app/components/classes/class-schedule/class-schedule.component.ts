import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormsModule,
  FormControl,
} from '@angular/forms';
import { combineLatest, map, Observable, startWith, take } from 'rxjs';
import { SubjectsService } from '../subjects/subject.service';
import { ClassSchedule, Subject, WeekDays } from '../classes.model';
import { ClassScheduleService } from '../classes.service';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-class-schedule',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatTimepickerModule,
    MatRadioModule,
    FormsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './class-schedule.component.html',
})
export class ClassScheduleComponent {
  private fb = inject(FormBuilder);
  private scheduleService = inject(ClassScheduleService);
  private subjectsService = inject(SubjectsService);
  private toast = inject(ToastrService);
  public dialogRef = inject(MatDialogRef<ClassScheduleComponent>);

  public isLoading = false;
  public weekDays = WeekDays;
  public schedules$!: Observable<ClassSchedule[]>;
  public subjects$!: Observable<Subject[]>;
  public subjectFilterCtrl: FormControl = new FormControl('');
  public filteredSubjects$!: Observable<Subject[]>;
  public minEndDate: Date | null = null;
  public maxStartDate: Date | null = null;

  public scheduleForm: FormGroup = this.fb.group({
    subjectId: [null, Validators.required],
    startDate: [null, Validators.required],
    endDate: [null, Validators.required],
    startTime: [null, Validators.required],
    endTime: [null, Validators.required],
    recurrence: ['none', Validators.required],
    mode: ['online', Validators.required],
    weekDays: this.fb.array([]),
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: ClassSchedule | null) {
    if (data) {
      this.scheduleForm.patchValue(data);

      const weekDaysArray = this.scheduleForm.get('weekDays') as FormArray;
      data.weekDays?.forEach((day) => weekDaysArray.push(this.fb.control(day)));
    }
  }

  ngOnInit() {
    this.schedules$ = this.scheduleService.getSchedules$();
    this.subjects$ = this.subjectsService.getSubjects$();

    this.filteredSubjects$ = combineLatest([
      this.subjects$,
      this.subjectFilterCtrl.valueChanges.pipe(startWith('')),
    ]).pipe(
      map(([subjects, filterValue]) =>
        subjects.filter((s) =>
          s.name.toLowerCase().includes((filterValue || '').toLowerCase())
        )
      )
    );
  }

  get weekDaysArray(): FormArray {
    return this.scheduleForm.get('weekDays') as FormArray;
  }

  public onDayToggle(dayKey: string, event: any) {
    const checked = event.checked;
    const weekDays = this.weekDaysArray;
    if (checked) {
      weekDays.push(this.fb.control(dayKey));
    } else {
      const index = weekDays.controls.findIndex((c) => c.value === dayKey);
      if (index >= 0) weekDays.removeAt(index);
    }
  }

  public saveSchedule() {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    const formValue = this.scheduleForm.value;
    this.isLoading = true;

    if (this.data?.id && this.data.subjectId === formValue.subjectId) {
      this.scheduleService
        .updateSchedule(this.data.id, formValue)
        .then(() => this.dialogRef.close())
        .catch((err) => console.error('შენახვა ვერ მოხერხდა', err))
        .finally(() => (this.isLoading = false));
      return;
    }

    this.scheduleService
      .checkDuplicateActiveSchedule(formValue.subjectId)
      .pipe(take(1))
      .subscribe((exists) => {
        if (exists) {
          this.isLoading = false;
          this.toast.error('ამ საგანზე უკვე ხართ დარეგისტრილებული.');
          return;
        }

        const saveObservable = this.data?.id
          ? this.scheduleService.updateSchedule(this.data.id, formValue)
          : this.scheduleService.addSchedule(formValue);

        saveObservable
          .then(() => this.dialogRef.close())
          .catch((err) => console.error('შენახვა ვერ მოხერხდა', err))
          .finally(() => (this.isLoading = false));
      });
  }

  public onStartDateChange(start: Date) {
    this.minEndDate = start;

    const end = this.scheduleForm.get('endDate')?.value;
    if (end && end < start) {
      this.scheduleForm.get('endDate')?.setValue(null);
    }
  }

  public onEndDateChange(end: Date) {
    this.maxStartDate = end;

    const start = this.scheduleForm.get('startDate')?.value;
    if (start && start > end) {
      this.scheduleForm.get('startDate')?.setValue(null);
    }
  }
}
