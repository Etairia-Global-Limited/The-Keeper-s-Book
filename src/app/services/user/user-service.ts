import { inject, Injectable } from '@angular/core';
import { SharedHttpService } from '../common/shared-http';
import { CreateUserPayload, IdPayload, SearchPayload } from '../../constants/model';
import { ApiResponse, ErrorResponse, PaginatedResponse, SuccessResponse, UserRow } from '../../constants/response.model';
import { Observable } from 'rxjs';
import { USER } from '../../constants/url.constants';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private service = inject(SharedHttpService);
  
  search(payload: SearchPayload):Observable<PaginatedResponse<any> | ErrorResponse>{
        return this.service.encryptedPost<PaginatedResponse<any> | ErrorResponse>(
          `${USER}get-all`, payload
        )
      }

        
         activate(payload: IdPayload):Observable<SuccessResponse | ErrorResponse>{
            return this.service.encryptedPost<SuccessResponse | ErrorResponse>(
              `${USER}activate`, payload
            )
          }        
      
         deactivate(payload: IdPayload):Observable<SuccessResponse | ErrorResponse>{
            return this.service.encryptedPost<SuccessResponse | ErrorResponse>(
              `${USER}deactivate`, payload
            )
          }
        
         create(payload: CreateUserPayload):Observable<SuccessResponse | ErrorResponse>{
            return this.service.encryptedPost<SuccessResponse | ErrorResponse>(
              `${USER}admin-create-app-user`, payload
            )
          }

     getAll():Observable<ApiResponse<any[]> | ErrorResponse>{
          return this.service.encryptedGet<ApiResponse<any[]> | ErrorResponse>(`${USER}retrieve-users`)
        }
        
            
}
