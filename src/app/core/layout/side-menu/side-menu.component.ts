import { Component, inject, HostListener } from '@angular/core';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MenuItem, MenuItems } from './side-menu.model';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterModule,
} from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatIconModule,
    CommonModule,
    RouterLink,
    RouterModule,
  ],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss',
})
export class SideMenuComponent {
  private router = inject(Router);
  public menuItems = MenuItems;

  public isMobile = false;
  public opened = true;

  ngOnInit() {
    this.checkViewport();
  }

  @HostListener('window:resize')
  checkViewport() {
    this.isMobile = window.innerWidth < 1024;
    this.opened = !this.isMobile;
  }

  toggleMenu() {
    this.opened = !this.opened;
  }

  private activeRoute$ = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.split('/')[1] || '')
    )
  );

  public isRouteActive(route: string): boolean {
    return route === this.activeRoute$();
  }

  public expandMenuItem(item: MenuItem): void {
    item.isExpanded = !item.isExpanded;
  }

  public isAnyChildActive(item: MenuItem): boolean {
    return item.children.some((child) => this.isRouteActive(child.route));
  }

  public shouldShowActive(item: MenuItem): boolean {
    if (item.route)
      return this.isRouteActive(item.route) || this.isAnyChildActive(item);
    return false;
  }
}
