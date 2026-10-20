import { Routes } from '@angular/router';
import { AdminShell } from './layout/admin-shell';
import { authGuard } from './services/auth/auth.guard';

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "sign-in" },
  { path: "sign-in", loadComponent: () => import("./pages/login/login").then((m) => m.Login) },
  {
    path: "",
    component: AdminShell,
    canActivate: [authGuard],
    children: [
      { path: "dashboard", loadComponent: () => import("./pages/dashboard/dashboard").then((m) => m.Dashboard) },
      { path: "applications", loadComponent: () => import("./pages/applications/application-list").then((m) => m.ApplicationList) },
      { path: "applications/new", loadComponent: () => import("./pages/applications/application-form").then((m) => m.ApplicationForm) },
      {
        path: "applications/:id/edit",
        data: { mode: "edit" },
        loadComponent: () => import("./pages/applications/application-form").then((m) => m.ApplicationForm),
      },
      {
        path: "application-users",
        loadComponent: () => import("./pages/application-users/application-user-list").then((m) => m.ApplicationUserList),
      },
      {
        path: "application-users/new",
        loadComponent: () => import("./pages/application-users/application-user-form").then((m) => m.ApplicationUserForm),
      },
      {
        path: "application-users/:id/edit",
        data: { mode: "edit" },
        loadComponent: () => import("./pages/application-users/application-user-form").then((m) => m.ApplicationUserForm),
      },
      {
        path: "application-roles",
        loadComponent: () => import("./pages/application-roles/application-role-list").then((m) => m.ApplicationRoleList),
      },
      {
        path: "application-roles/new",
        loadComponent: () => import("./pages/application-roles/application-role-form").then((m) => m.ApplicationRoleForm),
      },
      {
        path: "application-roles/:id/edit",
        data: { mode: "edit" },
        loadComponent: () => import("./pages/application-roles/application-role-form").then((m) => m.ApplicationRoleForm),
      },
      { path: "users", loadComponent: () => import("./pages/users/user-list").then((m) => m.UserList) },
      { path: "users/new", loadComponent: () => import("./pages/users/user-form").then((m) => m.UserForm) },
      { path: "users/:id/edit", data: { mode: "edit" }, loadComponent: () => import("./pages/users/user-form").then((m) => m.UserForm) },
      { path: "users/:id/kyc", loadComponent: () => import("./pages/users/user-kyc").then((m) => m.UserKyc) },
      { path: "clients", loadComponent: () => import("./pages/clients/client-list").then((m) => m.ClientList) },
      { path: "clients/new", loadComponent: () => import("./pages/clients/client-form").then((m) => m.ClientForm) },
      {
        path: "clients/:id/edit",
        data: { mode: "edit" },
        loadComponent: () => import("./pages/clients/client-form").then((m) => m.ClientForm),
      },
      { path: "audit-log", loadComponent: () => import("./pages/audit-log/audit-log").then((m) => m.AuditLog) },
    ],
  },
  { path: "**", redirectTo: "sign-in" },
];