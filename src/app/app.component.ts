import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/layout/header/header.component';
import { SideMenuComponent } from './core/layout/side-menu/side-menu.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, SideMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
})
export class AppComponent {
  public title = 'student-helper';
  public showHeaderAndMenu = true;
  private router = inject(Router);

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentRoute = this.router.routerState.root.snapshot.firstChild;
        this.showHeaderAndMenu = !currentRoute?.data['hideHeader'];
      });
    console.log(this.showHeaderAndMenu);
  }
}
