import { inject, Injectable } from '@angular/core';
import { DashboardData, DownloadPayload, SearchPayload } from '../../constants/model';
import { AUDIT_TRAIL } from '../../constants/url.constants';
import { ApiResponse, DownloadedFile, ErrorResponse, PaginatedResponse } from '../../constants/response.model';
import { Observable } from 'rxjs';
import { SharedHttpService } from '../common/shared-http';

@Injectable({
  providedIn: 'root',
})
export class AuditTrailService {
  private service = inject(SharedHttpService);
  
   search(payload: SearchPayload):Observable<PaginatedResponse<any> | ErrorResponse>{
      return this.service.encryptedPost<PaginatedResponse<any> | ErrorResponse>(
        `${AUDIT_TRAIL}search`, payload
      )
    }
  
export(payload: DownloadPayload): Observable<DownloadedFile> {
  return this.service.encryptedPost<DownloadedFile>(`${AUDIT_TRAIL}export`, payload);
}

      getDashboardData():Observable<ApiResponse<DashboardData> | ErrorResponse>{
        return this.service.encryptedGet(`${AUDIT_TRAIL}dashboard`)
      }


}
