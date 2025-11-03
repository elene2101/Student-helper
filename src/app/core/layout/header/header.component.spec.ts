import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { By } from '@angular/platform-browser';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      userProfile$: of({ firstName: 'Elene', lastName: 'Chelidze' }),
    });

    mockRouter = jasmine.createSpyObj('Router', ['navigate'], {
      routerState: { root: {} },
      url: '',
    });

    const mockActivatedRoute = {
      snapshot: { params: {}, queryParams: {} },
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user initials correctly', () => {
    const initialsEl = fixture.debugElement.query(
      By.css('.user')
    ).nativeElement;
    expect(initialsEl.textContent.trim()).toBe('EC');
  });

  it('should show tooltip with full name', () => {
    const tooltipAttr = fixture.debugElement.query(By.css('.user')).attributes;
    expect(tooltipAttr['ng-reflect-message'] || '').toContain('Elene Chelidze');
  });

  it('should navigate to /login after logout', async () => {
    mockAuthService.logout.and.returnValue(Promise.resolve());
    await component.logOut();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should have logo linking to dashboard', () => {
    const logo = fixture.debugElement.query(
      By.css('img[routerLink="/dashboard"]')
    );
    expect(logo).toBeTruthy();
  });
});
