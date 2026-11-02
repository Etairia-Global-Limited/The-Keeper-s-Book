import { inject, Injectable } from '@angular/core';
import { decrypt, encrypt } from '../../constants/utility';
import { EncryptionService } from '../encryption/encryption';
import { PasswordOptions } from '../../constants/model';

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

   private readonly sets = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{};:,.?',
  };

  generate(options: PasswordOptions): string {
    const selected = (Object.keys(this.sets) as (keyof typeof this.sets)[])
      .filter((key) => options[key])
      .map((key) => this.sets[key]);

    if (selected.length === 0) {
      throw new Error('Select at least one character type.');
    }
    if (options.length < selected.length) {
      throw new Error('Length is too short for the selected character types.');
    }

    const all = selected.join('');

    // Guarantee at least one character from each selected set
    const chars: string[] = selected.map((set) => set[this.randomInt(set.length)]);

    // Fill the remaining length from the combined pool
    while (chars.length < options.length) {
      chars.push(all[this.randomInt(all.length)]);
    }

    // Shuffle so the guaranteed characters aren't always first
    for (let i = chars.length - 1; i > 0; i--) {
      const j = this.randomInt(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join('');
  }

  /** Unbiased random integer in [0, max) */
  private randomInt(max: number): number {
    const limit = Math.floor(0x100000000 / max) * max;
    const buf = new Uint32Array(1);
    do {
      crypto.getRandomValues(buf);
    } while (buf[0] >= limit);
    return buf[0] % max;
  }
}
