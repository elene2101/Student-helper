import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  public registrationForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  public error: string | null = null;

  get firstName() {
    return this.registrationForm.get('firstName');
  }
  get lastName() {
    return this.registrationForm.get('lastName');
  }
  get email() {
    return this.registrationForm.get('email');
  }
  get password() {
    return this.registrationForm.get('password');
  }

  public async register() {
    if (!this.registrationForm.valid) return;

    this.error = null;

    const firstNameValue = this.firstName?.value || '';
    const lastNameValue = this.lastName?.value || '';
    const emailValue = this.email?.value || '';
    const passwordValue = this.password?.value || '';

    try {
      const userCredential = await this.auth.register(
        emailValue,
        passwordValue
      );
      await this.auth.saveUserProfile(
        userCredential.user.uid,
        firstNameValue,
        lastNameValue,
        emailValue
      );
      this.router.navigate(['/dashboard']);
    } catch (err) {
      console.error(err);
      this.error = this.auth.mapFirebaseError(err);
    }
  }
}
