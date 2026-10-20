import { Component, computed, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormField, form, required, submit } from "@angular/forms/signals";
import { PageHeader } from "../../shared/page-header";

@Component({
  selector: "app-application-role-form",
  imports: [RouterLink, FormField, PageHeader],
  templateUrl: "./application-role-form.html",
})
export class ApplicationRoleForm {
  /** Set `data: { mode: 'edit' }` on the edit route (needs withComponentInputBinding()). */
  readonly mode = input<"create" | "edit">("create");
  /** The :id route param in edit mode. */
  readonly id = input<string>();

  protected readonly isEdit = computed(() => this.mode() === "edit");

  protected readonly applicationOptions = ["Customer Portal", "FormField Operations", "Partner Hub", "Billing Console"];
  protected readonly statusOptions = ["Active", "Inactive", "Pending"];

  private readonly model = signal({
    roleName: "",
    application: "",
    status: "",
    description: "",
    permissions: { view: false, create: false, update: false, delete: false, approve: false, export: false },
  });

  protected readonly f = form(this.model, (p) => {
    required(p.roleName, { message: "Role name is required." });
    required(p.application, { message: "Application is required." });
    required(p.status, { message: "Status is required." });
  });

  // TODO (edit mode): load the record for id() and call this.model.set(...) with it.

  protected save(event: Event) {
    event.preventDefault();
    submit(this.f, async () => {
      // TODO: call your service. this.isEdit() ? update(this.id(), this.model()) : create(this.model())
    });
  }
}
