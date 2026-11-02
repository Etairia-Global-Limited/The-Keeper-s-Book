import { inject, Injectable } from '@angular/core';
import { SharedHttpService } from '../common/shared-http';
import { KYC_REVIEW, KYC_STORAGE } from '../../constants/url.constants';
import { ApiResponse } from '../../constants/response.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KycService {
  private service = inject(SharedHttpService);

  getCountries():Observable <ApiResponse<any>>{
    return this.service.encryptedGet<ApiResponse<any>>(`${KYC_STORAGE}countries`)
  }

  getUserReview(id: string  ):Observable <ApiResponse<any>>{
    return this.service.encryptedGet<ApiResponse<any>>(`${KYC_REVIEW}users/${id}`)
  }

}
