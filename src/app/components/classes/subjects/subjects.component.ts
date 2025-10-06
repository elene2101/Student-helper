import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { Subject, SubjectsService } from './subject.service';
import { ToastrService } from 'ngx-toastr';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

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
export class SubjectsComponent {
  private toast = inject(ToastrService);
  private subjectsService = inject(SubjectsService);

  public subjects$: Observable<Subject[]> = this.subjectsService.getSubjects$();

  public showAddInput = false;
  public newSubjectForm = new FormGroup({
    name: new FormControl('', Validators.required),
  });

  public editingId: string | null = null;
  public editForm = new FormGroup({
    name: new FormControl('', Validators.required),
  });

  public toggleAddInput() {
    this.showAddInput = !this.showAddInput;
    this.newSubjectForm.reset();
  }

  public addSubject() {
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

  public startEdit(subject: Subject) {
    this.editingId = subject.id!;
    this.editForm.patchValue({ name: subject.name });
  }

  public saveEdit(subject: Subject) {
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

  public cancelEdit() {
    this.editingId = null;
  }

  public deleteSubject(subject: Subject) {
    if (!subject.id) return;

    try {
      this.subjectsService.deleteSubject(subject.id);
    } catch (err) {
      this.toast.error('საგნის წაშლა ვერ მოხერხდა');
      console.error(err);
    }
  }
}
