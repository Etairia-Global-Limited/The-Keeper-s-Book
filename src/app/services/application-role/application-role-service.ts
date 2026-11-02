import { inject, Injectable } from '@angular/core';
import { SharedHttpService } from '../common/shared-http';
import { ApiResponse, ErrorResponse, PaginatedResponse, SuccessResponse } from '../../constants/response.model';
import { Observable } from 'rxjs';
import { APPLICATION_ROLE } from '../../constants/url.constants';
import {
  CreateRolePayload,
  SearchPayload,
  UpdateRolePayload,
} from '../../constants/model';

@Injectable({
  providedIn: 'root',
})
export class ApplicationRoleService {
  private service = inject(SharedHttpService);

  create(payload: CreateRolePayload): Observable<SuccessResponse | ErrorResponse> {
    return this.service.encryptedPost<SuccessResponse | ErrorResponse>(
      `${APPLICATION_ROLE}create`, payload
    );
  }

  search(payload: SearchPayload): Observable<PaginatedResponse<any> | ErrorResponse> {
    return this.service.encryptedPost<PaginatedResponse<any> | ErrorResponse>(
      `${APPLICATION_ROLE}search`, payload
    );
  }

  getByApplicationId(applicationId: string): Observable<ApiResponse<any[]> | ErrorResponse> {
    return this.service.encryptedGet<ApiResponse<any[]> | ErrorResponse>(
      `${APPLICATION_ROLE}get-by-appId/${applicationId}`
    );
  }

  getById(id: string): Observable<ApiResponse<any> | ErrorResponse> {
    return this.service.encryptedGet<ApiResponse<any> | ErrorResponse>(
      `${APPLICATION_ROLE}get-by-id/${id}`
    );
  }

  update(payload: UpdateRolePayload): Observable<SuccessResponse | ErrorResponse> {
    return this.service.encryptedPatch<SuccessResponse | ErrorResponse>(
      `${APPLICATION_ROLE}update/`, payload
    );
  }

  activate(id: string): Observable<SuccessResponse | ErrorResponse> {
    return this.service.encryptedPatch<SuccessResponse | ErrorResponse>(
      `${APPLICATION_ROLE}activate/${id}`, {}
    );
  }

  deactivate(id: string): Observable<SuccessResponse | ErrorResponse> {
    return this.service.encryptedPatch<SuccessResponse | ErrorResponse>(
      `${APPLICATION_ROLE}deactivate/${id}`, {}
    );
  }
}