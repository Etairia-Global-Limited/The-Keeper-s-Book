import { Component, computed, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormField, email, form, required, submit } from "@angular/forms/signals";
import { PageHeader } from "../../shared/page-header";

@Component({
  selector: "app-client-form",
  imports: [RouterLink, FormField, PageHeader],
  templateUrl: "./client-form.html",
})
export class ClientForm {
  /** Set `data: { mode: 'edit' }` on the edit route (needs withComponentInputBinding()). */
  readonly mode = input<"create" | "edit">("create");
  /** The :id route param in edit mode. */
  readonly id = input<string>();

  protected readonly isEdit = computed(() => this.mode() === "edit");

  protected readonly statusOptions = ["Active", "Inactive", "Pending"];

  private readonly model = signal({
    clientName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    country: "",
    status: "",
    address: "",
  });

  protected readonly f = form(this.model, (p) => {
    required(p.clientName, { message: "Client name is required." });
    required(p.contactName, { message: "Contact name is required." });
    required(p.contactEmail, { message: "Contact email is required." });
    email(p.contactEmail, { message: "Enter a valid email address." });
    required(p.country, { message: "Country is required." });
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
