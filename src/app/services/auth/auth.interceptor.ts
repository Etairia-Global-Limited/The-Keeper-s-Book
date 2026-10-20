import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router'; // was 'express'
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth-service';

// These handle their own 401s: the guard's validate call, logout, and a failed login.
const isAuthCall = (url: string): boolean =>
  url.startsWith('/auth/') || url.includes('/nexus/auth/login');

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // The server already refreshes expired tokens, so a 401 here means the session is over.
      // Checking `authenticated()` makes a burst of parallel 401s redirect only once.
      if (isBrowser && err.status === 401 && !isAuthCall(req.url) && auth.authenticated()) {
        auth.clear();
        router.navigate(['/sign-in'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => err);
    }),
  );
};