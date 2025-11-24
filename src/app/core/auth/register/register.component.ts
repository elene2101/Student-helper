import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  private readonly destroy$ = new Subject<void>();

  public loading = false;
  public error: string | null = null;
  public success: string | null = null;

  public registrationForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async register() {
    if (this.registrationForm.invalid) return;
    this.error = null;
    this.success = null;
    this.loading = true;

    const { firstName, lastName, email, password } =
      this.registrationForm.value;
    try {
      await this.auth.register(email!, password!, firstName!, lastName!);
      this.success =
        'გამოიგზავნა ელფოსტის დადასტურების ბმული. გთხოვთ, შეამოწმოთ თქვენი მეილი.';
    } catch (err) {
      console.error(err);
      this.error = this.auth.mapFirebaseError(err);
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.registrationForm.reset();
    this.error = null;
  }
}
