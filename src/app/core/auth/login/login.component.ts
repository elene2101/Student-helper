import { Component, OnDestroy, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  private readonly destroy$ = new Subject<void>();

  public loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  public error: string | null = null;

  get email() {
    return this.loginForm.get('email');
  }
  get password() {
    return this.loginForm.get('password');
  }

  public async login(): Promise<void> {
    if (this.loginForm.invalid) return;

    this.error = null;

    const emailValue = this.email?.value || '';
    const passwordValue = this.password?.value || '';

    try {
      await this.auth.login(emailValue, passwordValue);
      this.router.navigate(['/dashboard']);
    } catch (err) {
      console.error(err);
      this.error = this.auth.mapFirebaseError(err);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.loginForm.reset();
    this.error = null;
  }
}
