import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth-service';

export const authGuard: CanActivateFn = (_route, state) => {
  // On the server, server.ts has already validated the page load.
  if (isPlatformServer(inject(PLATFORM_ID))) return true;

  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.authenticated()) return true; // validated already, skip the network call

  return auth.getAccessToken(state.url).pipe(
    map((ok) => ok || router.createUrlTree(['/sign-in'], { queryParams: { returnUrl: state.url } })),
  );
};