import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, Subject as RxSubject } from 'rxjs';
import { SubjectsService } from './subject.service';
import { ToastrService } from 'ngx-toastr';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from '../classes.model';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.scss'],
})
export class SubjectsComponent implements OnDestroy {
  private toast = inject(ToastrService);
  private subjectsService = inject(SubjectsService);

  private readonly destroy$ = new RxSubject<void>();
  public subjects$: Observable<Subject[]> = this.subjectsService.getSubjects$();

  public showAddInput = false;
  public newSubjectForm = new FormGroup({
    name: new FormControl('', Validators.required),
  });

  public editingId: string | null = null;
  public editForm = new FormGroup({
    name: new FormControl('', Validators.required),
  });

  public toggleAddInput(): void {
    this.showAddInput = !this.showAddInput;
    this.newSubjectForm.reset();
  }

  public addSubject(): void {
    if (this.newSubjectForm.invalid) return;
    try {
      const value = this.newSubjectForm.value.name!;
      this.subjectsService.addSubject(value, false);
      this.newSubjectForm.reset();
      this.showAddInput = false;
    } catch (err) {
      console.error(err);
      this.toast.error('საგნის დამატება ვერ მოხერხდა');
    }
  }

  public startEdit(subject: Subject): void {
    this.editingId = subject.id!;
    this.editForm.patchValue({ name: subject.name });
  }

  public saveEdit(subject: Subject): void {
    if (this.editForm.invalid) return;
    try {
      this.subjectsService.updateSubject(
        subject.id!,
        this.editForm.value.name!
      );
      this.editingId = null;
    } catch (err) {
      this.toast.error('საგნის რედაქტირება ვერ მოხდა');
      console.error(err);
    }
  }

  public cancelEdit(): void {
    this.editingId = null;
  }

  public deleteSubject(subject: Subject): void {
    if (!subject.id) return;

    try {
      this.subjectsService.deleteSubject(subject.id);
    } catch (err) {
      this.toast.error('საგნის წაშლა ვერ მოხერხდა');
      console.error(err);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.newSubjectForm.reset();
    this.editForm.reset();

    this.showAddInput = false;
    this.editingId = null;
  }
}
