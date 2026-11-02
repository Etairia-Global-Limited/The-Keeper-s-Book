import { Component, computed, DestroyRef, inject, input, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { FormField, email, form, required, submit } from "@angular/forms/signals";
import { PageHeader } from "../../shared/page-header";
import { KycService } from "../../services/kyc/kyc-service";
import { ApplicationOwnerService } from "../../services/application-owner/application-owner-service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { catchError, finalize, Observable } from "rxjs";
import { isApiResponse, isSuccessResponse, toErrorResponse } from "../../constants/schema";
import { CreateOwnerPayload } from "../../constants/model";
import { ErrorResponse, SuccessResponse } from "../../constants/response.model";

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
  private country = inject(KycService)
  private service = inject(ApplicationOwnerService);
  private destroyRef = inject(DestroyRef);
  private loading = signal(false);
  private router = inject(Router);

  protected readonly isEdit = computed(() => this.mode() === "edit");

  protected readonly statusOptions = ["Active", "Inactive", "Pending"];
  protected readonly adminOptions = [
    {
      id: true,
      name: 'True'
    },
    {
      id: false,
      name: 'False'
    }
  ]
  readonly countries = signal<any[]>([]) 

  private readonly model = signal({
    name: "",
    email: "",
    contact: "",
    address: "",
    country: "",
    status: "",
    isAdmin: false,
  });

  
  protected readonly f = form(this.model, (p) => {
    required(p.name, { message: "Client name is required." });
    required(p.address, { message: "Contact Address is required." });
    required(p.contact, { message: "Contact name is required." });
    email(p.email, { message: "Enter a valid email address." });
    required(p.country, { message: "Country is required." });
    required(p.status, { message: "Status is required." });
  required(p.isAdmin, { message: "Status is required." });
  });

    ngOnInit(): void {
  this.getAll();

  const id = this.id();
  if (this.isEdit() && id) {
    this.loadOwner(id);
  }
}

private loadOwner(id: string) {
  this.service.getById(id)
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(toErrorResponse),
    )
    .subscribe((response) => {
      if (isSuccessResponse(response)) {
        // adjust to your response shape
        const app = (response as any).data;
        console.log('App: ', app)
        this.model.set({
          name: app.name,
    email: app.email,
    contact: app.contact,
    address: app.address,
    country: app.country,
    status: app.status,
    isAdmin: app.isAdmin,
        });
      }
    });
}

protected save(event: Event) {
  event.preventDefault();

  submit(this.f, async () => {
    const {
                name,
    email,
    contact,
    address,
    country,
    status,
    isAdmin,
    } = this.model();

    const payload: CreateOwnerPayload = {
      name,
      email,
    contact,
    address,
    country,
    status,
    isAdmin,
    };

    const request$: Observable<SuccessResponse | ErrorResponse> = this.isEdit()
      ? this.service.update({ id: this.id() ?? '', ...payload })
      : this.service.create(payload);

    this.loading.set(true);

    request$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(toErrorResponse),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((response) => {
        if (isSuccessResponse(response)) {
          this.router.navigate(['clients']);
        }
      });
  });
}

  getAll(){
    // const isApiResponse = (r: ApiResponse<OwnerModel[]> | ErrorResponse | null): r is ApiResponse<OwnerModel[]> => r !== null && r.statusCode === 200;
    
    this.country.getCountries().pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(toErrorResponse)
    ).subscribe((response) => {
      if(isApiResponse(response)){
        this.countries.set(response.data)
        console.log('Response: ', response.data)
      }
    })
  }
}
