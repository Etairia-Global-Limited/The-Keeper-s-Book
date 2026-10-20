import { Component, signal } from "@angular/core";
import { FormField, form } from "@angular/forms/signals";
import { PageHeader } from "../../shared/page-header";
import { StatusBadge } from "../../shared/status-badge";

interface AuditRow {
  id: string;
  time: string;
  actor: string;
  action: string;
  entity: string;
  ip: string;
  result: string;
}

@Component({
  selector: "app-audit-log",
  imports: [FormField, PageHeader, StatusBadge],
  templateUrl: "./audit-log.html",
})
export class AuditLog {
  protected readonly filterOptions = ["All actions", "Sign in", "Role change", "User created", "Access revoked"];

  private readonly filterModel = signal({ search: "", filter: "All actions" });
  protected readonly filters = form(this.filterModel);

  // TODO: replace the sample rows with your API data
  protected readonly rows = signal<AuditRow[]>([
    { id: "1", time: "16 Oct, 10:05", actor: "Daniel Adeyemi", action: "Sign in", entity: "User", ip: "102.89.34.21", result: "Success" },
    {
      id: "2",
      time: "16 Oct, 09:41",
      actor: "Chioma Nwosu",
      action: "Role change",
      entity: "Application Role",
      ip: "102.89.34.7",
      result: "Success",
    },
    { id: "3", time: "16 Oct, 09:12", actor: "Amara Okafor", action: "Sign in", entity: "User", ip: "41.58.12.90", result: "Success" },
    { id: "4", time: "16 Oct, 08:57", actor: "Unknown", action: "Sign in", entity: "User", ip: "197.210.8.113", result: "Failed" },
    {
      id: "5",
      time: "15 Oct, 17:20",
      actor: "Chioma Nwosu",
      action: "Access revoked",
      entity: "Application User",
      ip: "102.89.34.7",
      result: "Success",
    },
    { id: "6", time: "15 Oct, 15:03", actor: "Tunde Bello", action: "User created", entity: "User", ip: "105.112.60.4", result: "Success" },
  ]);

  protected downloadCsv() {
    // TODO: call your service to export the audit log
  }
}
