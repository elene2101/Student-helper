import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { AuthService } from '../../auth/auth.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatTooltip, AsyncPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  public userProfile$ = this.authService.userProfile$;

  public logOut() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
