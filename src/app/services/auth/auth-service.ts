import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, retry, tap, throwError, timer } from 'rxjs';
import { SharedHttpService } from '../common/shared-http';
import { LoginPayload } from '../../constants/model';
import { ApiResponse, ErrorResponse, LoginResopnse } from '../../constants/response.model';
import { AUTH } from '../../constants/url.constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private doc = inject(DOCUMENT);
  private service = inject(SharedHttpService)

readonly authenticated = signal(false);
readonly checked = signal(false);

getAccessToken(route: string): Observable<boolean> {
  return this.http.get('/auth/validate', { params: { route } }).pipe(
    // retry only on network errors / 5xx, not on a 401
    retry({
      count: 1,
      delay: (err: HttpErrorResponse) =>
        err.status === 0 || err.status >= 500 ? timer(500) : throwError(() => err),
    }),
    map(() => true),
    catchError(() => of(false)),
    tap((ok) => {
      this.authenticated.set(ok);
      this.checked.set(true);
    }),
  );
}

clear(): void {
  this.authenticated.set(false);
}

  login(payload: LoginPayload): Observable<LoginResopnse | ErrorResponse>{
    return this.service.encryptedPost<LoginResopnse | ErrorResponse>(
      `${AUTH}login`, payload
    )
  }

  logout(): void {
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to login or home page
    this.router.navigate(['/']);
  }
}
