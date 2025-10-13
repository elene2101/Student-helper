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
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { combineLatest, map, Observable, startWith } from 'rxjs';
import { Subject } from '../../classes/classes.model';
import { SubjectsService } from '../../classes/subjects/subject.service';
import { ExamsService } from '../exams.service';
import { ToastrService } from 'ngx-toastr';
import { Exam } from '../exams.model';
import { QuillModules } from '../../assignments/assignments.model';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-add-exam',
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
    MatTimepickerModule,
    QuillModule,
  ],
  templateUrl: './add-exam.component.html',
  styleUrls: ['./add-exam.component.scss'],
})
export class AddExamComponent {
  examData = input<Exam | null>(null);
  public closeAddExamEvent = output();
  public quillModules = QuillModules;

  private fb = inject(FormBuilder);
  private examsService = inject(ExamsService);
  private subjectsService = inject(SubjectsService);
  private toast = inject(ToastrService);

  public subjects$!: Observable<Subject[]>;
  public filteredSubjects$!: Observable<Subject[]>;
  public subjectFilterCtrl = new FormControl('');

  public examTypes = ['გამოცდა', 'ქვიზი'];
  public locations = ['კამპუსში', 'ონლაინ'];

  public isLoading = false;

  public examForm = this.fb.group({
    name: ['', Validators.required],
    subjectId: ['', Validators.required],
    type: ['', Validators.required],
    location: ['', Validators.required],
    room: [''],
    date: [null as Date | null, Validators.required],
    time: ['', Validators.required],
    duration: ['', [Validators.required, Validators.min(1)]],
    description: [''],
  });

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

    this.examForm.get('location')?.valueChanges.subscribe((loc) => {
      const roomCtrl = this.examForm.get('room');
      if (loc === 'კამპუსში') {
        roomCtrl?.addValidators(Validators.required);
      } else {
        roomCtrl?.clearValidators();
        roomCtrl?.setValue('');
      }
      roomCtrl?.updateValueAndValidity();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['examData'] && this.examData()) {
      this.examForm.patchValue(this.examData() as any);
    } else {
      this.examForm.reset();
    }
  }

  public saveExam() {
    if (this.examForm.invalid) return;
    this.isLoading = true;

    const formValue = this.examForm.value;
    const payload: Partial<Exam> | any = {
      ...formValue,
    };

    try {
      if (this.examData()?.id) {
        this.examsService
          .updateExam(this.examData()?.id || '', payload)
          .then(() => {
            this.toast.success('გამოცდა წარმატებით განახლდა');
          });
        this.closeExamAdd();
      } else {
        this.examsService.addExam(payload as Exam).then(() => {
          this.toast.success('გამოცდა წარმატებით დაემატა');
        });
        this.closeExamAdd();
      }
    } catch (err) {
      console.error('შენახვის შეცდომა:', err);
      this.toast.error('გამოცდის შენახვა ვერ მოხერხდა');
    } finally {
      this.isLoading = false;
    }
  }

  public closeExamAdd() {
    this.closeAddExamEvent.emit();
  }
}
