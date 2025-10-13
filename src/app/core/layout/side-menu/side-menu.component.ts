import { Component, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MenuItem, MenuItems } from './side-menu.model';
import { MatMenuModule } from '@angular/material/menu';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterModule,
} from '@angular/router';
import { filter, map } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-side-menu',
  imports: [
    MatSidenavModule,
    MatIconModule,
    CommonModule,
    MatMenuModule,
    RouterLink,
    MatTooltipModule,
    RouterModule,
  ],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss',
})
export class SideMenuComponent {
  private router = inject(Router);

  public menuItems = MenuItems;

  private activeRoute$ = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.split('/')[1] || '')
    )
  );

  isRouteActive(route: string): boolean {
    return route === this.activeRoute$();
  }

  expandMenuItem(item: MenuItem): void {
    item.isExpanded = !item.isExpanded;
  }

  isAnyChildActive(item: MenuItem): boolean {
    return item.children.some((child) => this.isRouteActive(child.route));
  }

  shouldShowActive(item: MenuItem): boolean {
    if (item.route)
      return this.isRouteActive(item.route) || this.isAnyChildActive(item);
    return false;
  }
}
