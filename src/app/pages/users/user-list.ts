import { Component, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormField, form } from "@angular/forms/signals";
import { PageHeader } from "../../shared/page-header";
import { StatusBadge } from "../../shared/status-badge";

interface UserRow {
  id: string;
  name: string;
  email: string;
  type: string;
  mfa: string;
  lastLogin: string;
  status: string;
}

@Component({
  selector: "app-user-list",
  imports: [RouterLink, FormField, PageHeader, StatusBadge],
  templateUrl: "./user-list.html",
})
export class UserList {
  protected readonly filterOptions = ["All statuses", "Active", "Suspended", "Pending"];

  private readonly filterModel = signal({ search: "", filter: "All statuses" });
  protected readonly filters = form(this.filterModel);

  // TODO: replace the sample rows with your API data
  protected readonly rows = signal<UserRow[]>([
    {
      id: "1",
      name: "Amara Okafor",
      email: "amara@alpha.com",
      type: "Client user",
      mfa: "Enabled",
      lastLogin: "Today, 09:12",
      status: "Active",
    },
    {
      id: "2",
      name: "Tunde Bello",
      email: "tunde@beacon.com",
      type: "Client user",
      mfa: "Enabled",
      lastLogin: "Yesterday",
      status: "Active",
    },
    {
      id: "3",
      name: "Chioma Nwosu",
      email: "chioma@etairia.com",
      type: "Staff",
      mfa: "Enabled",
      lastLogin: "Today, 07:58",
      status: "Active",
    },
    {
      id: "4",
      name: "Ibrahim Sani",
      email: "ibrahim@delta.com",
      type: "Client user",
      mfa: "Not set",
      lastLogin: "5 days ago",
      status: "Suspended",
    },
    { id: "5", name: "Zainab Musa", email: "zainab@alpha.com", type: "Client user", mfa: "Not set", lastLogin: "Never", status: "Pending" },
    {
      id: "6",
      name: "Grace Mensah",
      email: "grace@crestline.com",
      type: "Client user",
      mfa: "Enabled",
      lastLogin: "3 days ago",
      status: "Active",
    },
  ]);

  protected suspend(row: UserRow) {
    // TODO: call your service for "Suspend" on row.id
  }
}
