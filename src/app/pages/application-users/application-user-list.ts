import { Component, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormField, form } from "@angular/forms/signals";
import { PageHeader } from "../../shared/page-header";
import { StatusBadge } from "../../shared/status-badge";

interface ApplicationUserRow {
  id: string;
  user: string;
  email: string;
  application: string;
  role: string;
  lastAccess: string;
  status: string;
}

@Component({
  selector: "app-application-user-list",
  imports: [RouterLink, FormField, PageHeader, StatusBadge],
  templateUrl: "./application-user-list.html",
})
export class ApplicationUserList {
  protected readonly filterOptions = ["All applications", "Customer Portal", "FormField Operations", "Partner Hub"];

  private readonly filterModel = signal({ search: "", filter: "All applications" });
  protected readonly filters = form(this.filterModel);

  // TODO: replace the sample rows with your API data
  protected readonly rows = signal<ApplicationUserRow[]>([
    {
      id: "1",
      user: "Amara Okafor",
      email: "amara@alpha.com",
      application: "Customer Portal",
      role: "Administrator",
      lastAccess: "Today, 09:12",
      status: "Active",
    },
    {
      id: "2",
      user: "Tunde Bello",
      email: "tunde@beacon.com",
      application: "FormField Operations",
      role: "Supervisor",
      lastAccess: "Yesterday",
      status: "Active",
    },
    {
      id: "3",
      user: "Grace Mensah",
      email: "grace@crestline.com",
      application: "Partner Hub",
      role: "Manager",
      lastAccess: "3 days ago",
      status: "Active",
    },
    {
      id: "4",
      user: "Ifeanyi Eze",
      email: "ifeanyi@delta.com",
      application: "Reports Studio",
      role: "Viewer",
      lastAccess: "2 weeks ago",
      status: "Inactive",
    },
    {
      id: "5",
      user: "Zainab Musa",
      email: "zainab@alpha.com",
      application: "Billing Console",
      role: "Auditor",
      lastAccess: "Today, 08:40",
      status: "Pending",
    },
    {
      id: "6",
      user: "Daniel Adeyemi",
      email: "daniel@beacon.com",
      application: "Support Desk",
      role: "Agent",
      lastAccess: "Today, 10:05",
      status: "Active",
    },
  ]);

  protected revoke(row: ApplicationUserRow) {
    // TODO: call your service for "Revoke" on row.id
  }
}
