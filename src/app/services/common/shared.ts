import { inject, Injectable } from '@angular/core';
import { decrypt, encrypt } from '../../constants/utility';
import { EncryptionService } from '../encryption/encryption';

@Injectable({
  providedIn: 'root',
})
export class SharedState {
  private prefix = 'state';
  private service = inject(EncryptionService);

  async save(state: any): Promise<string> {
    const id = crypto.randomUUID().slice(0, 8);
    const encryptData = await encrypt(state, this.service.getAESKey());
    sessionStorage.setItem(this.prefix + id, encryptData);
    return id;
  }

  async get(id: string): Promise<any | null> {
    const value = sessionStorage.getItem(this.prefix + id);
    if (value) {
      const data = await decrypt(value, this.service.getAESKey());
      return data;
    }
    return null;
  }

  clear(id: string) {
    sessionStorage.removeItem(this.prefix + id);
  }

  clearAll() {
    sessionStorage.clear();
  }

  async update(id: string, patch: Partial<any>): Promise<void> {
    const existing = await this.get(id);
    if (existing === null) {
      throw new Error(`No stored state found for id: ${id}`);
    }
    const merged = { ...existing, ...patch };
    const encryptData = await encrypt(merged, this.service.getAESKey());
    sessionStorage.setItem(this.prefix + id, encryptData);
  }
}
