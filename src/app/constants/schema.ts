import { HttpErrorResponse } from "@angular/common/http";
import { ApiResponse, ErrorResponse, PaginatedResponse, SuccessResponse } from "./response.model";
import { Observable, of } from "rxjs";

export type Environment = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION'

export const isSuccessResponse = (r: SuccessResponse | ErrorResponse | null): r is SuccessResponse =>
  r?.statusCode === 200;

export const isApiResponse = (r: ApiResponse<any> | ErrorResponse | null): r is ApiResponse<any> =>
  r?.statusCode === 200;

export const isPaginatedResponse = (r: PaginatedResponse<any> | ErrorResponse): r is PaginatedResponse<any> =>
  r.statusCode === 200;

export const toErrorResponse = (err: HttpErrorResponse): Observable<ErrorResponse> =>
  of<ErrorResponse>({
    statusCode: err.status || 500,
    message: err.error?.message ?? 'Something went wrong. Please try again.',
    error: err.error,
  });
  