import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login',
      'mapFirebaseError',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        RouterTestingModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
      ],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should be valid when email and password are filled correctly', () => {
    component.loginForm.setValue({
      email: 'test@example.com',
      password: '123456',
    });
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should handle login error correctly', async () => {
    const mockError = { code: 'auth/wrong-password' };
    authServiceSpy.login.and.returnValue(Promise.reject(mockError));
    authServiceSpy.mapFirebaseError.and.returnValue('პაროლი არასწორია');

    component.loginForm.setValue({
      email: 'wrong@test.com',
      password: '123456',
    });

    await component.login();

    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(authServiceSpy.mapFirebaseError).toHaveBeenCalledWith(mockError);
    expect(component.error).toBe('პაროლი არასწორია');
  });

  it('should not attempt login if form invalid', async () => {
    component.loginForm.setValue({
      email: '',
      password: '',
    });

    await component.login();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should disable login button when form is invalid', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTrue();
  });

  it('should display error message when error is set', async () => {
    component.error = 'პაროლი არასწორია';
    fixture.detectChanges();

    const errorMsg = fixture.nativeElement.querySelector('p.text-red-600');
    expect(errorMsg.textContent).toContain('პაროლი არასწორია');
  });
});
