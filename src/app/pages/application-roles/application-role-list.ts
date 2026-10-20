import { Component, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormField, form } from "@angular/forms/signals";
import { PageHeader } from "../../shared/page-header";
import { StatusBadge } from "../../shared/status-badge";

interface ApplicationRoleRow {
  id: string;
  role: string;
  application: string;
  description: string;
  permissions: string;
  users: string;
  status: string;
}

@Component({
  selector: "app-application-role-list",
  imports: [RouterLink, FormField, PageHeader, StatusBadge],
  templateUrl: "./application-role-list.html",
})
export class ApplicationRoleList {
  protected readonly filterOptions = ["All applications", "Customer Portal", "FormField Operations", "Partner Hub"];

  private readonly filterModel = signal({ search: "", filter: "All applications" });
  protected readonly filters = form(this.filterModel);

  // TODO: replace the sample rows with your API data
  protected readonly rows = signal<ApplicationRoleRow[]>([
    {
      id: "1",
      role: "Administrator",
      application: "Customer Portal",
      description: "Full access to settings and users",
      permissions: "24",
      users: "6",
      status: "Active",
    },
    {
      id: "2",
      role: "Manager",
      application: "Partner Hub",
      description: "Manage records and approve requests",
      permissions: "16",
      users: "31",
      status: "Active",
    },
    {
      id: "3",
      role: "Supervisor",
      application: "FormField Operations",
      description: "Review and assign field tasks",
      permissions: "12",
      users: "58",
      status: "Active",
    },
    {
      id: "4",
      role: "Auditor",
      application: "Billing Console",
      description: "Read-only access to logs and reports",
      permissions: "8",
      users: "4",
      status: "Active",
    },
    {
      id: "5",
      role: "Agent",
      application: "Support Desk",
      description: "Handle and update tickets",
      permissions: "10",
      users: "120",
      status: "Active",
    },
    {
      id: "6",
      role: "Viewer",
      application: "Reports Studio",
      description: "View dashboards only",
      permissions: "3",
      users: "74",
      status: "Inactive",
    },
  ]);

  protected remove(row: ApplicationRoleRow) {
    // TODO: call your service for "Delete" on row.id
  }
}
