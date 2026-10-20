import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import express, { CookieOptions, Request, RequestHandler, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import * as crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import https from 'node:https';
import { extname, join } from 'node:path';
import { decrypt, encrypt } from './app/constants/utility';
 
// ───────────────────────────── Config ─────────────────────────────
 
const browserDistFolder = join(import.meta.dirname, '../browser');
 
const BASE_URL = process.env['BASE_URL'];
const CLIENT_NAME = process.env['CLIENT_ID'] ?? '';
const CLIENT_SECRET = process.env['CLIENT_SECRET'] ?? '';
const dev = process.env['DEV'] === 'true';
const IS_DEV_ENV = process.env['ENV'] === 'dev';
 
const KEY_DIR = process.env['RSA_KEY_DIR'] || 'C:\\Users\\iawe\\Documents\\Projects\\dangote-ipo';
const publicKey = readFileSync(join(KEY_DIR, 'public.pem'), 'utf8');
const privateKey = readFileSync(join(KEY_DIR, 'private.pem'), 'utf8');
const masterKey = readFileSync(join(KEY_DIR, 'master.key'));
 
const UNPROTECTED_ROUTES = new Set<string>(['/sign-in']); // Angular pages
const PUBLIC_API_PATHS = new Set<string>(['/auth/login']); // backend endpoints
const BODY_METHODS = new Set<string>(['POST', 'PUT', 'PATCH']);
const MAX_FILE_BYTES = 5 * 1024 * 1024;
 
const SEAL_TTL_MS = 60 * 60 * 1000;
// Used only when a token is not a JWT and therefore carries no `exp`.
const ACCESS_TTL_MS = 30 * 60 * 1000;
const REFRESH_TTL_MS = 60 * 60 * 1000;
 
const COOKIE_BASE: CookieOptions = { httpOnly: true, secure: true, sameSite: 'lax' };
 
const apiCaller = axios.create({
  baseURL: BASE_URL,
  httpsAgent: new https.Agent({ rejectUnauthorized: dev }),
});

// Seal (per-session AES key) 
const encryptAesKey = (key: Uint8Array): string => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);
  const cipherText = Buffer.concat([cipher.update(key), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, cipherText]).toString('base64url');
}

const decryptAesKey = (encryptedKey: string): Uint8Array => {
  const buffer = Buffer.from(encryptedKey, 'base64url');
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const cipherText = buffer.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey, iv);
  decipher.setAuthTag(tag);
  return new Uint8Array(Buffer.concat([decipher.update(cipherText), decipher.final()]));
}

// Session helpers  
const normalize = (route: string): string => route.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
 
const readToken = (req: Request): string | undefined =>
  req.cookies['auth_token'] ?? (IS_DEV_ENV ? req.cookies['dev_token'] : undefined);
 
const backendHeaders = (req: Request): Record<string, string> => ({
  name: CLIENT_NAME,
  key: CLIENT_SECRET,
  'x-client-type': 'mobile',
  'x-client-user-agent': req.headers['user-agent'] ?? '',
  'x-forwarded-for': req.ip ?? '',
});
 
// The cookie lives exactly as long as the JWT. Once it ages out the browser drops it,
// which ensureSession() treats the same as an expired token and refreshes.
const cookieOptions = (token: string, fallbackTtlMs: number): CookieOptions => {
  const exp = (jwt.decode(token) as JwtPayload | null)?.exp;
  return exp
    ? { ...COOKIE_BASE, expires: new Date(exp * 1000) }
    : { ...COOKIE_BASE, maxAge: fallbackTtlMs };
};
 
const setSession = (res: Response, accessToken: string, refreshToken?: string): void => {
  res.cookie('auth_token', accessToken, cookieOptions(accessToken, ACCESS_TTL_MS));
  if (refreshToken) {
    res.cookie('refresh_token', refreshToken, cookieOptions(refreshToken, REFRESH_TTL_MS));
  }
};

// Clears the login only. Keep `seal`: the proxy needs it even to log in.
const clearSession = (res: Response): void => {
  for (const name of ['auth_token', 'dev_token', 'refresh_token']) {
    res.clearCookie(name, COOKIE_BASE);
  }
};
 
type TokenResult =
  | { status: 'valid'; payload: JwtPayload }
  | { status: 'expired' }
  | { status: 'missing' }
  | { status: 'invalid' };
 
const verifyToken = (token?: string): TokenResult => {
  if (!token) return { status: 'missing' };
  try {
    const payload = jwt.verify(token, process.env['JWT_SECRET']!, { algorithms: ['HS256'] }) as JwtPayload;
    return { status: 'valid', payload };
  } catch (err) {
    return err instanceof jwt.TokenExpiredError ? { status: 'expired' } : { status: 'invalid' };
  }
};
 
type RefreshResult =
  | { status: 'ok'; accessToken: string }
  | { status: 'rejected' } // refresh token expired/revoked: the session is over
  | { status: 'error' }; // network/server problem: the session may still be fine
 
interface RefreshResponseDto {
  data?: { accessToken?: string };
}
 
const requestRefresh = async (refreshToken: string, req: Request): Promise<RefreshResult> => {
  try {
    const r = await apiCaller.post<RefreshResponseDto>(
      '/auth/refresh', // adjust to your real refresh path
      { refreshToken },
      { headers: backendHeaders(req), timeout: 5000, validateStatus: () => true },
    );
 
    if (r.status === 401 || r.status === 403) return { status: 'rejected' };
    if (r.status < 200 || r.status >= 300) return { status: 'error' };
 
    const accessToken = r.data?.data?.accessToken;
    return accessToken ? { status: 'ok', accessToken } : { status: 'error' };
  } catch {
    return { status: 'error' }; // network error or timeout
  }
};
 
// Parallel requests carrying the same refresh token share one refresh call.
const inflight = new Map<string, Promise<RefreshResult>>();
 
const refreshAccessToken = (refreshToken: string, req: Request): Promise<RefreshResult> => {
  let pending = inflight.get(refreshToken);
  if (!pending) {
    pending = requestRefresh(refreshToken, req).finally(() => inflight.delete(refreshToken));
    inflight.set(refreshToken, pending);
  }
  return pending;
};
 
type Session =
  | { ok: true; payload: JwtPayload }
  | { ok: false; status: 401 | 503; message: string };
 
/**
 * The single place that decides whether a request has a usable session.
 * Valid access token -> ok. Expired/missing -> refresh once and set the new cookie.
 * Tampered -> 401, no refresh. Backend unreachable -> 503, cookies kept.
 */
const ensureSession = async (req: Request, res: Response): Promise<Session> => {
  const current = verifyToken(readToken(req));
  if (current.status === 'valid') return { ok: true, payload: current.payload };
 
  const deny = (status: 401 | 503, message: string): Session => {
    if (status === 401) clearSession(res);
    return { ok: false, status, message };
  };
 
  if (current.status === 'invalid') return deny(401, 'Unauthorized');
 
  const refreshToken: string | undefined = req.cookies['refresh_token'];
  if (!refreshToken) return deny(401, 'Unauthorized');
 
  const refreshed = await refreshAccessToken(refreshToken, req);
  if (refreshed.status === 'rejected') return deny(401, 'Session expired');
  if (refreshed.status === 'error') return deny(503, 'Unable to refresh session');
 
  // Never trust the refresh response blindly.
  const verified = verifyToken(refreshed.accessToken);
  if (verified.status !== 'valid') return deny(401, 'Unauthorized');
 
  setSession(res, refreshed.accessToken);
  req.cookies['auth_token'] = refreshed.accessToken; // readToken(req) now returns the fresh token
  return { ok: true, payload: verified.payload };
};

const app = express()

app.use(express.json({ limit: '5mb'}));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

const allowedCors = (process.env['ALLOWED_ORIG'] ?? 'localhost')
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean);

const angularApp = new AngularNodeAppEngine({
allowedHosts: allowedCors
});

app.get('/api/retrieve-token', (req, res) => {
  res.json({ publicKey });
});

app.post('/api/retrieve-token', (req, res) => {
  const { encryptedKey } = req.body;

  try {
    const aesKey = crypto.privateDecrypt(
      { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
      Buffer.from(encryptedKey, 'base64'),
    );

    res.cookie('seal', encryptAesKey(aesKey), {
      ...COOKIE_BASE,
      maxAge: SEAL_TTL_MS,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Decryption error:', error);
    res.status(400).json({ error: 'Handshake failed' });
  }
});

// ───────────────────────────── API proxy ─────────────────────────────
 
const apiPath = (req: Request): string => req.path.replace(/^\/nexus/, '');
 
// The seal (session AES key) is required on every call, including login.
const requireSeal: RequestHandler = (req, res, next) => {
  try {
    res.locals['key'] = decryptAesKey(req.cookies['seal']);
  } catch {
    res.status(401).json({ error: 'Invalid session' });
    return;
  }
  next();
};
 
// Everything except the public endpoints needs a session, refreshed silently if it expired.
const requireApiSession: RequestHandler = async (req, res, next) => {
  if (PUBLIC_API_PATHS.has(apiPath(req))) return next();
 
  const session = await ensureSession(req, res);
  if (!session.ok) {
    res.status(session.status).json({ message: session.message });
    return;
  }
  next();
};

app.all('/nexus/*splat', requireSeal, requireApiSession, async (req, res): Promise<void> => {
    const key: Uint8Array = res.locals['key'];
    const api = apiPath(req);
    const token = readToken(req);

 // 3. Headers are built after the key exists, so name and key go with every call.
     const headers: Record<string, string> = {
    'Content-Type': req.headers['content-type'] || 'application/json',
    ...backendHeaders(req),
    ...(token && { Authorization: `Bearer ${token}` }),
  };

   try {
    let data: unknown;
 
    if (BODY_METHODS.has(req.method) && req.body?.payload) {
      const decrypted: any = await decrypt(req.body.payload, key);
      const file = decrypted?.File;
 
      if (file?.__file) {
        const buffer = Buffer.from(file.data, 'base64');
        if (buffer.length > MAX_FILE_BYTES) {
          res.status(413).json({ message: 'File size should not exceed 5MB' });
          return;
        }
 
        const form = new FormData();
        form.append('File', new Blob([new Uint8Array(buffer)], { type: file.type }), file.name);
        data = form;
        delete headers['Content-Type']; // let the multipart boundary be set automatically
      } else {
        data = decrypted;
      }
    }
 
    const response = await apiCaller.request({
      method: req.method,
      url: api,
      params: req.query,
      data,
      headers,
    });

    if (api === '/auth/login' && response.data.access_token) {
  //     access_token: string;
  // refresh_token: string;
  // username: string;
  // userId: string;
  // roleId: string;
     setSession(res, response.data.access_token, response.data.refresh_token)
    }

    // if (key) {
    //   const encryptedResponse = await encrypt(response.data || response.data.message, key);
    //   return res.status(response.status).json({ data: encryptedResponse });
    // }

    // return res.status(response.status).json(response.data);
    res.status(response.status).json({ data: await encrypt(response.data || response.data.message, key) });
  } catch (error: any) {
    console.error('Error: ', error.message);
    const status = error?.response?.status || 500;
    const data = error?.response?.data || 'Proxy error';
    res.status(status).json(data);
  }
});

app.get('/auth/validate', async (req, res): Promise<void> => {
  res.set('Cache-Control', 'no-store');

  const raw = req.query['route'];
  const route = typeof raw === 'string' ? normalize(raw) : undefined;

  // Public pages skip validation entirely. A missing route is treated as protected.
  if (route && UNPROTECTED_ROUTES.has(route)) {
    res.json({ valid: true, public: true });
    return;
  }

   const session = await ensureSession(req, res);
  if (!session.ok) {
    res.status(session.status).json({ message: session.message });
    return;
  }
 
  const { payload } = session;
  res.json({
    valid: true,
    user: { id: payload.sub, username: payload['username'], role: payload['role'], roleId: payload['roleId'], userId: payload['userId'] },
  });
});

app.post('/auth/logout', (_req, res) => {
  clearSession(res);
  res.json({ message: 'Logged out' });
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// Guards full page loads only, not assets or API calls. Client-side navigation
// is covered by the Angular route guard and the proxy middleware above.
app.use(async (req, res, next): Promise<void> => {
  const isPageLoad =
    (req.method === 'GET' || req.method === 'HEAD') && req.accepts('html') && !extname(req.path);
  if (!isPageLoad) return next();
 
  const session = await ensureSession(req, res);
 
  if (UNPROTECTED_ROUTES.has(normalize(req.path))) {
    // Send signed-in users away from the sign-in page.
    return session.ok ? res.redirect(302, '/dashboard') : next();
  }
 
  if (session.ok) return next();
 
  if (session.status === 503) {
    res.status(503).send('Service temporarily unavailable');
    return;
  }
 
  res.redirect(302, '/sign-in'); // ensureSession already cleared the cookies
});

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
