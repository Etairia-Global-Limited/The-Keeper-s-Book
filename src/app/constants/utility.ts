const METHOD = 'AES-GCM';
const LENGTH = 256;

export async function createKey(rawKey: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new Uint8Array(rawKey) as unknown as ArrayBuffer, // ✅ force strict type
    { name: METHOD, length: LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encrypt(data: object, secret: Uint8Array): Promise<string> {
  const key = await createKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: METHOD,
      iv,
    },
    key,
    encoded,
  );

  const newPayload = new Uint8Array(iv.byteLength + encrypted.byteLength);
  newPayload.set(iv, 0);
  newPayload.set(new Uint8Array(encrypted), iv.byteLength);

  const finalPayload = arrayBufferToBase64(newPayload.buffer)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return finalPayload;
}

export async function decrypt<T>(payload: string, secret: Uint8Array): Promise<T> {
  const key = await createKey(secret);

  const base64 = payload
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');

  const newPayload = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const iv = newPayload.slice(0, 12);
  const text = newPayload.slice(12);

  const decrypted = await crypto.subtle.decrypt({ name: METHOD, iv }, key, text);
  const finalResult = JSON.parse(new TextDecoder().decode(decrypted)) as T;

  return finalResult;
}

export async function encryptablePayload(
  payload: Record<string, any>,
): Promise<Record<string, any>> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (value instanceof File || value instanceof Blob) {
      const buffer = await value.arrayBuffer();
      result[key] = {
        __file: true,
        name: value instanceof File ? value.name : undefined,
        type: value.type,
        data: arrayBufferToBase64(buffer), // use the chunked base64 helper from earlier
      };
    } else {
      result[key] = value;
    }
  }

  return result;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const CHUNK_SIZE = 0x8000; // 32KB per chunk, safely under call-stack argument limits
  let binary = '';

  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

export function reconstructFiles(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object' && value.__file) {
      result[key] = Buffer.from(value.data, 'base64'); // or reattach name/type as needed
    } else {
      result[key] = value;
    }
  }
  return result;
}

// currency-symbols.util.ts
export const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£',
  GHS: '₵',
  KES: 'KSh',
  ZAR: 'R',
  CAD: 'CA$',
  JPY: '¥',
  // add more as needed
};

export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code?.toUpperCase()] ?? code;
}
