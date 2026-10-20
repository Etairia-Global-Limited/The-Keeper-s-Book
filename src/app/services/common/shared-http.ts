import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { from, Observable, of, switchMap } from 'rxjs';
import { decrypt, encrypt, encryptablePayload } from '../../constants/utility';
import { KYC_STORAGE, } from '../../constants/url.constants';
import { EncryptionService } from '../encryption/encryption';

@Injectable({
  providedIn: 'root',
})
export class SharedHttpService {
  private http = inject(HttpClient);
  private service = inject(EncryptionService);

  private withEncryption<T>(
    makeRequest: (encryptedPayload: string | null, sessionId: string) => Observable<any>,
    payload?: any,
  ): Observable<T> {
    return from(this.service.start()).pipe(
      switchMap(() =>
        payload !== undefined ? from(encrypt(payload, this.service.getAESKey())) : of(null),
      ),
      switchMap((encryptedPayload) => makeRequest(encryptedPayload, this.service.getSessionId())),
      switchMap((response) => from(decrypt<T>(response.data, this.service.getAESKey()))),
    );
  }

  // Thin verb-specific wrappers
  encryptedGet<T>(url: string, params: Record<string, any> = {}): Observable<T> {
    return this.withEncryption<T>((_payload) => this.http.get<any>(url));
  }

  encryptedPost<T>(url: string, payload?: any): Observable<T> {
    return this.withEncryption<T>(
      (encryptedPayload, sessionId) =>
        this.http.post<any>(url, { payload: encryptedPayload, sessionId }),
      payload,
    );
  }

  encryptedPut<T>(url: string, payload?: any): Observable<T> {
    return this.withEncryption<T>(
      (encryptedPayload, sessionId) =>
        this.http.put<any>(url, { payload: encryptedPayload, sessionId }),
      payload,
    );
  }

  encryptedPatch<T>(url: string, payload?: any): Observable<T> {
    return this.withEncryption<T>(
      (encryptedPayload, sessionId) =>
        this.http.patch<any>(url, { payload: encryptedPayload, sessionId }),
      payload,
    );
  }

  encryptedDelete<T>(url: string, params: Record<string, any> = {}): Observable<T> {
    return this.withEncryption<T>((_payload, sessionId) =>
      this.http.delete<any>(url, { params: { ...params, sessionId } }),
    );
  }

  encryptImage<T>(payload: File): Observable<T> {
    return from(this.service.start()).pipe(
      switchMap(() => from(encryptablePayload({ File: payload }))),
      switchMap((plain) => from(encrypt(plain, this.service.getAESKey()))),
      switchMap((encrypted) =>
        this.http.post<any>(`${KYC_STORAGE}/upload-document`, {
          payload: encrypted,
          sessionId: this.service.getSessionId(),
        }),
      ),
      switchMap((response) => from(decrypt<T>(response.data, this.service.getAESKey()))),
    );
  }
}
