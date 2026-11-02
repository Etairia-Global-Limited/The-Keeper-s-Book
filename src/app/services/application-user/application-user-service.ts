import { inject, Injectable } from '@angular/core';
import { SharedHttpService } from '../common/shared-http';
import { ApiResponse, ErrorResponse, PaginatedResponse, SuccessResponse } from '../../constants/response.model';
import { Observable } from 'rxjs';
import { APPLICATION_USER } from '../../constants/url.constants';
import {
  BulkUsersPayload,
  CreateAppUserPayload,
  SearchPayload,
  UpdateAppUserPayload,
} from '../../constants/model';

@Injectable({
  providedIn: 'root',
})
export class ApplicationUserService {
  private service = inject(SharedHttpService);

  create(payload: CreateAppUserPayload): Observable<SuccessResponse | ErrorResponse> {
    return this.service.encryptedPost<SuccessResponse | ErrorResponse>(
      `${APPLICATION_USER}create`, payload
    );
  }

  search(payload: SearchPayload): Observable<PaginatedResponse<any> | ErrorResponse> {
    return this.service.encryptedPost<PaginatedResponse<any> | ErrorResponse>(
      `${APPLICATION_USER}search`, payload
    );
  }

  getBulkUsersBy(payload: BulkUsersPayload): Observable<ApiResponse<any[]> | ErrorResponse> {
    return this.service.encryptedPost<ApiResponse<any[]> | ErrorResponse>(
      `${APPLICATION_USER}get-bulk-users-by`, payload
    );
  }

  getById(id: string): Observable<ApiResponse<any> | ErrorResponse> {
    return this.service.encryptedGet<ApiResponse<any> | ErrorResponse>(
      `${APPLICATION_USER}get-by/${id}`
    );
  }

  update(payload: UpdateAppUserPayload): Observable<SuccessResponse | ErrorResponse> {
    return this.service.encryptedPatch<SuccessResponse | ErrorResponse>(
      `${APPLICATION_USER}update`, payload
    );
  }

  activate(userId: string): Observable<SuccessResponse | ErrorResponse> {
    return this.service.encryptedPatch<SuccessResponse | ErrorResponse>(
      `${APPLICATION_USER}activate/${userId}`, {}
    );
  }

  deactivate(userId: string): Observable<SuccessResponse | ErrorResponse> {
    return this.service.encryptedPatch<SuccessResponse | ErrorResponse>(
      `${APPLICATION_USER}deactivate/${userId}`, {}
    );
  }
}