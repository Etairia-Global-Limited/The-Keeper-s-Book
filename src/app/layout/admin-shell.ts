import { Component, signal } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
  selector: "app-admin-shell",
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: "./admin-shell.html",
})
export class AdminShell {
  protected readonly menuOpen = signal(false);

  protected readonly nav = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Applications", path: "/applications" },
    { label: "Application Users", path: "/application-users" },
    { label: "Application Roles", path: "/application-roles" },
    { label: "Users", path: "/users" },
    { label: "Clients", path: "/clients" },
    { label: "Audit Log", path: "/audit-log" },
  ];
}
