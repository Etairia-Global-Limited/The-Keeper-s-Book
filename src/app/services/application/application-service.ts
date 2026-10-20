import { inject, Injectable } from '@angular/core';
import { CreateApplicationPayload, SearchPayload, UpdateApplicationPayload } from '../../constants/model';
import { Observable } from 'rxjs';
import { ApiResponse, ErrorResponse, PaginatedResponse, SuccessResponse } from '../../constants/response.model';
import { SharedHttpService } from '../common/shared-http';
import { APPLICATION } from '../../constants/url.constants';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private service = inject(SharedHttpService);

  create(payload: CreateApplicationPayload):Observable<SuccessResponse | ErrorResponse>{
    return this.service.encryptedPost<SuccessResponse | ErrorResponse>(
      `${APPLICATION}create`, payload
    )
  }

  getAll():Observable<ApiResponse<any> | ErrorResponse>{
    return this.service.encryptedGet(`${APPLICATION}all-app`)
  }

  getById(id: string):Observable<ApiResponse<any> | ErrorResponse>{
    return this.service.encryptedGet(`${APPLICATION}get-by-id/${id}`)
  }

  search(payload: SearchPayload):Observable<PaginatedResponse<any> | ErrorResponse>{
    return this.service.encryptedPost<PaginatedResponse<any> | ErrorResponse>(
      `${APPLICATION}search`, payload
    )
  }

  activate(id: string):Observable<SuccessResponse | ErrorResponse>{
    return this.service.encryptedPatch<SuccessResponse | ErrorResponse>(
      `${APPLICATION}activate/${id}`, {}
    )
  }

  deactivate(id: string):Observable<SuccessResponse | ErrorResponse>{
    return this.service.encryptedPatch<SuccessResponse | ErrorResponse>(
      `${APPLICATION}deactivate/${id}`, {}
    )
  }

  update(payload: UpdateApplicationPayload):Observable<SuccessResponse | ErrorResponse>{
    return this.service.encryptedPatch<SuccessResponse | ErrorResponse>(
      `${APPLICATION}update`, payload
    )
  }

}
