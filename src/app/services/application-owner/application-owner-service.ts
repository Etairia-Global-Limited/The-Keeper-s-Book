import { inject, Injectable } from '@angular/core';
import { SharedHttpService } from '../common/shared-http';
import { ApiResponse, ErrorResponse, OwnerModel, PaginatedResponse, SuccessResponse } from '../../constants/response.model';
import { Observable } from 'rxjs';
import { APPLICATION_OWNER } from '../../constants/url.constants';
import { CreateOwnerPayload, IdPayload, SearchPayload, UpdateOwnerPayload } from '../../constants/model';

@Injectable({
  providedIn: 'root',
})
export class ApplicationOwnerService {
  private service = inject(SharedHttpService);
  
   create(payload: CreateOwnerPayload):Observable<SuccessResponse | ErrorResponse>{
      return this.service.encryptedPost<SuccessResponse | ErrorResponse>(
        `${APPLICATION_OWNER}create`, payload
      )
    }

     search(payload: SearchPayload):Observable<PaginatedResponse<any> | ErrorResponse>{
        return this.service.encryptedPost<PaginatedResponse<any> | ErrorResponse>(
          `${APPLICATION_OWNER}search`, payload
        )
      }
  
   approve(payload: IdPayload):Observable<SuccessResponse | ErrorResponse>{
      return this.service.encryptedPost<SuccessResponse | ErrorResponse>(
        `${APPLICATION_OWNER}approve`, payload
      )
    }
  
   reject(payload: IdPayload):Observable<SuccessResponse | ErrorResponse>{
      return this.service.encryptedPost<SuccessResponse | ErrorResponse>(
        `${APPLICATION_OWNER}reject`, payload
      )
    }
  
    getAll():Observable<ApiResponse<OwnerModel[]> | ErrorResponse>{
      return this.service.encryptedGet<ApiResponse<OwnerModel[]> | ErrorResponse>(`${APPLICATION_OWNER}get-all`)
    }

      update(payload: UpdateOwnerPayload):Observable<SuccessResponse | ErrorResponse>{
        return this.service.encryptedPatch<SuccessResponse | ErrorResponse>(
          `${APPLICATION_OWNER}update`, payload
        )
      }

      
        getById(id: string):Observable<ApiResponse<any> | ErrorResponse>{
          return this.service.encryptedGet(`${APPLICATION_OWNER}get-by-id/${id}`)
        }
}
