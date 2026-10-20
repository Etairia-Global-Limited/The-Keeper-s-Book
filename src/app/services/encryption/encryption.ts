import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RETREIVE_TOKEN } from '../../constants/url.constants';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  private id = crypto.randomUUID();
  private key: Uint8Array | null = null;
  private initPromise: Promise<void> | null = null;
  private http = inject(HttpClient);

  start():Promise<void>{
    if(!this.initPromise){
      this.initPromise = this.handshake().catch((err) => {
        this.initPromise = null;
        throw err;
      })
    }

    return this.initPromise;
  }

  private async handshake(): Promise<void>{
    const {publicKey} = await firstValueFrom(
      this.http.get<{publicKey: string}>(`${RETREIVE_TOKEN}`)
    );

    this.key = crypto.getRandomValues(new Uint8Array(32));

    const encryptedKey = await this.encryptWithPubKey(publicKey, this.key);

    await firstValueFrom(this.http.post(`${RETREIVE_TOKEN}`, {encryptedKey, sessionId: this.id}))
  }

  getSessionId(): string{
    return this.id;
  }

  getAESKey():Uint8Array{
    if(!this.key){
      throw new Error('Encryption initialization failed')
    }
    return this.key;
  }

  private async encryptWithPubKey(publicKeyPem: string, data: Uint8Array): Promise<string> {
    const pemContents = publicKeyPem.replace(
      /-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n/g,
      '',
    );

    const keyBuffer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

    const publicKey = await crypto.subtle.importKey(
      'spki',
      keyBuffer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt'],
    );

    const dataBuffer = data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength,
    ) as ArrayBuffer;

    const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, dataBuffer);

    const result = btoa(String.fromCharCode(...new Uint8Array(encrypted)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return result;
  }

}
