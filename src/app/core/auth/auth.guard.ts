import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate() {
    return this.auth.user$.pipe(
      map((user) => {
        if (user) return true;
        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}
