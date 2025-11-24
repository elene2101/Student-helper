import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;
  let navigateSpy: jasmine.Spy;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'register',
      'saveUserProfile',
      'mapFirebaseError',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        RouterTestingModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
      ],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.registrationForm.valid).toBeFalse();
  });

  it('should be valid when all fields are filled correctly', () => {
    component.registrationForm.setValue({
      firstName: 'Elene',
      lastName: 'Chelidze',
      email: 'elene@test.com',
      password: '123456',
    });
    expect(component.registrationForm.valid).toBeTrue();
  });

  it('should set error message when registration fails', async () => {
    const mockError = { code: 'auth/email-already-in-use' };
    authServiceSpy.register.and.returnValue(Promise.reject(mockError));
    authServiceSpy.mapFirebaseError.and.returnValue('მეილი უკვე არსებობს');

    component.registrationForm.setValue({
      firstName: 'Elene',
      lastName: 'Chelidze',
      email: 'elene@test.com',
      password: 'password123',
    });

    await component.register();

    expect(authServiceSpy.register).toHaveBeenCalled();
    expect(authServiceSpy.mapFirebaseError).toHaveBeenCalledWith(mockError);
    expect(component.error).toBe('მეილი უკვე არსებობს');
  });

  it('should not attempt registration when form invalid', async () => {
    component.registrationForm.setValue({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    });

    await component.register();

    expect(authServiceSpy.register).not.toHaveBeenCalled();
    expect(authServiceSpy.saveUserProfile).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should display error message when error exists', () => {
    component.error = 'მეილი უკვე არსებობს';
    fixture.detectChanges();

    const errorMsg = fixture.nativeElement.querySelector('p.text-red-600');
    expect(errorMsg.textContent).toContain('მეილი უკვე არსებობს');
  });

  it('should disable register button when form invalid', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTrue();
  });
});
