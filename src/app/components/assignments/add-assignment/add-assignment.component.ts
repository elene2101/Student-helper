import { CommonModule } from '@angular/common';
import { Component, inject, input, output, SimpleChanges } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  Assignment,
  AssignmentsType,
  QuillModules,
} from '../assignments.model';
import { AssignmentsService } from '../assignment.service';
import { Subject } from '../../classes/classes.model';
import { combineLatest, map, Observable, startWith } from 'rxjs';
import { SubjectsService } from '../../classes/subjects/subject.service';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { QuillModule } from 'ngx-quill';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-assignment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatFormFieldModule,
    QuillModule,
    MatTimepickerModule,
  ],
  templateUrl: './add-assignment.component.html',
  styleUrls: ['./add-assignment.component.scss'],
})
export class AddAssignmentComponent {
  public assignmentData = input<Assignment | null>(null);
  public closeAddAssignmentEvent = output();

  private fb = inject(FormBuilder);
  private assignmentsService = inject(AssignmentsService);
  private subjectsService = inject(SubjectsService);
  private toast = inject(ToastrService);

  public assignmentsType = AssignmentsType;
  public quillModules = QuillModules;

  public subjects$!: Observable<Subject[]>;
  public filteredSubjects$!: Observable<Subject[]>;

  public subjectFilterCtrl = new FormControl('');
  public assignmentForm = this.fb.group({
    subject: [null, Validators.required],
    description: ['', Validators.required],
    deadline: [null as null | Date, Validators.required],
    deadlineTime: [null as null | Date, Validators.required],
    type: [''],
  });

  public isLoading = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['assignmentData'] && this.assignmentData()) {
      this.assignmentForm.patchValue(this.assignmentData() as any);
    } else {
      this.assignmentForm.reset();
    }
  }

  ngOnInit() {
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

  public saveSchedule() {
    if (this.assignmentForm.invalid) return;
    this.isLoading = true;

    const formValue = this.assignmentForm.value;
    const assignmentPayload: Partial<Assignment> | any = {
      ...formValue,
      completed: this.assignmentData()?.completed ?? false,
    };

    try {
      if (this.assignmentData()?.id) {
        this.assignmentsService
          .updateAssignment(this.assignmentData()?.id || '', assignmentPayload)
          .then(() => {
            this.toast.success('დავალება წარმატებით განახლდა');
          });
        this.closeAddAssignment();
      } else {
        this.assignmentsService
          .addAssignment(assignmentPayload as Assignment)
          .then(() => {
            this.toast.success('დავალება წარმატებით დაემატა');
          });
        this.closeAddAssignment();
      }
    } catch (err) {
      console.error('შენახვის შეცდომა:', err);
      this.toast.error('დავალების დამატება ვერ მოხერხდა');
    } finally {
      this.isLoading = false;
    }
  }

  public closeAddAssignment() {
    this.closeAddAssignmentEvent.emit();
  }

  public compareById(
    o1: { id: number; name: string },
    o2: { id: number; name: string }
  ): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }
}
