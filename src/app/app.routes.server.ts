import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Parameterized routes: render per request, not at build time
  { path: 'applications/:id/edit', renderMode: RenderMode.Server },
  { path: 'application-users/:id/edit', renderMode: RenderMode.Server },
  { path: 'application-roles/:id/edit', renderMode: RenderMode.Server },
  { path: 'users/:id/edit', renderMode: RenderMode.Server },
  { path: 'application-users/:id/kyc', renderMode: RenderMode.Server },
  { path: 'clients/:id/edit', renderMode: RenderMode.Server },

  // Everything else keeps the existing behaviour
  { path: '**', renderMode: RenderMode.Prerender },
];
