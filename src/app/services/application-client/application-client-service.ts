import { inject, Injectable } from '@angular/core';
import { SharedHttpService } from '../common/shared-http';
import { Observable } from 'rxjs';
import { CreateApplicationClientPayload, SearchPayload } from '../../constants/model';
import { SuccessResponse, ErrorResponse, PaginatedResponse } from '../../constants/response.model';
import { CLIENT } from '../../constants/url.constants';

@Injectable({
  providedIn: 'root',
})
export class ApplicationClientService {
  private service = inject(SharedHttpService);

  create(payload: CreateApplicationClientPayload): Observable<SuccessResponse | ErrorResponse> {
    return this.service.encryptedPost<SuccessResponse | ErrorResponse>(`${CLIENT}create`, payload);
  }

  search(payload: SearchPayload): Observable<PaginatedResponse<any> | ErrorResponse> {
    return this.service.encryptedPost<PaginatedResponse<any> | ErrorResponse>(
      `${CLIENT}search`,
      payload,
    );
  }
}
