import { Component, computed, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormField, email, form, required, submit } from "@angular/forms/signals";
import { PageHeader } from "../../shared/page-header";

@Component({
  selector: "app-user-form",
  imports: [RouterLink, FormField, PageHeader],
  templateUrl: "./user-form.html",
})
export class UserForm {
  /** Set `data: { mode: 'edit' }` on the edit route (needs withComponentInputBinding()). */
  readonly mode = input<"create" | "edit">("create");
  /** The :id route param in edit mode. */
  readonly id = input<string>();

  protected readonly isEdit = computed(() => this.mode() === "edit");

  protected readonly typeOptions = ["Client user", "Staff"];
  protected readonly clientOptions = ["Alpha Holdings", "Beacon Logistics", "Crestline Trade", "Delta Services"];
  protected readonly statusOptions = ["Active", "Suspended", "Pending"];

  private readonly model = signal({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    type: "",
    client: "",
    status: "",
    requireMfa: false,
  });

  protected readonly f = form(this.model, (p) => {
    required(p.firstName, { message: "First name is required." });
    required(p.lastName, { message: "Last name is required." });
    required(p.email, { message: "Email is required." });
    email(p.email, { message: "Enter a valid email address." });
    required(p.type, { message: "Type is required." });
    required(p.client, { message: "Client is required." });
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
