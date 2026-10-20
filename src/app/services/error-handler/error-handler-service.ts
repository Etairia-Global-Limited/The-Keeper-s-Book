import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  handleError(error: HttpErrorResponse | Error): Error {
    if (isPlatformBrowser(this.platformId) && error instanceof Error) {
      return new Error('A client-side error occurred');
    }

    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 400:
          return new Error('Invalid request data');
        case 401:
          return new Error('Unauthorized access');
        case 403:
          return new Error('Access forbidden');
        case 404:
          return new Error('Account linking service not found');
        case 422:
          return new Error('Invalid OTP or reference');
        case 500:
          return new Error('Internal server error');
        case 503:
          return new Error('Service temporarily unavailable');
        default:
          return new Error(
            error.error?.message || 'An unexpected error occurred'
          );
      }
    }

    return new Error('An unexpected error occurred');
  }
}
