import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SideMenuComponent } from './side-menu.component';
import { provideRouter, Router, NavigationEnd } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { MenuItem } from './side-menu.model';

describe('SideMenuComponent', () => {
  let component: SideMenuComponent;
  let fixture: ComponentFixture<SideMenuComponent>;
  let router: Router;
  let routerEvents$: Subject<NavigationEnd>;

  beforeEach(async () => {
    routerEvents$ = new Subject<NavigationEnd>();

    await TestBed.configureTestingModule({
      imports: [
        SideMenuComponent,
        CommonModule,
        MatSidenavModule,
        MatIconModule,
      ],
      providers: [
        provideRouter([]),
        {
          provide: Router,
          useValue: {
            events: routerEvents$.asObservable(),
            navigate: jasmine.createSpy('navigate'),
            url: '',
            routerState: { root: {} },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SideMenuComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle menu state', () => {
    const initial = component.opened;
    component.toggleMenu();
    expect(component.opened).toBe(!initial);
  });

  it('should detect mobile viewport correctly', () => {
    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(600);
    component.checkViewport();
    expect(component.isMobile).toBeTrue();
    expect(component.opened).toBeFalse();
  });

  it('should detect desktop viewport correctly', () => {
    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1400);
    component.checkViewport();
    expect(component.isMobile).toBeFalse();
    expect(component.opened).toBeTrue();
  });

  it('should mark route active when NavigationEnd fires', () => {
    routerEvents$.next(new NavigationEnd(1, '/dashboard', '/dashboard'));
    expect(component.isRouteActive('dashboard')).toBeTrue();
    expect(component.isRouteActive('classes')).toBeFalse();
  });

  it('should expand and collapse menu items', () => {
    const item: MenuItem = {
      text: 'Classes',
      route: 'classes',
      isExpanded: false,
      children: [],
    };
    component.expandMenuItem(item);
    expect(item.isExpanded).toBeTrue();
    component.expandMenuItem(item);
    expect(item.isExpanded).toBeFalse();
  });

  it('should detect active child route', () => {
    const item: MenuItem = {
      text: 'Parent',
      route: '',
      isExpanded: false,
      children: [
        { text: 'Child1', route: 'dashboard' },
        { text: 'Child2', route: 'other' },
      ],
    };
    routerEvents$.next(new NavigationEnd(1, '/dashboard', '/dashboard'));
    expect(component.isAnyChildActive(item)).toBeTrue();
  });

  it('should return true for shouldShowActive when route is active', () => {
    const item: MenuItem = {
      text: 'Dashboard',
      route: 'dashboard',
      isExpanded: false,
      children: [],
    };
    routerEvents$.next(new NavigationEnd(1, '/dashboard', '/dashboard'));
    expect(component.shouldShowActive(item)).toBeTrue();
  });
});
