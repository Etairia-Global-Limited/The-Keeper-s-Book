import { Component, computed, DestroyRef, inject, input, OnInit, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { FormField, form, required, submit } from "@angular/forms/signals";
import { PageHeader } from "../../shared/page-header";
import { ApplicationOwnerService } from "../../services/application-owner/application-owner-service";
import { ApplicationService } from "../../services/application/application-service";
import { ApiResponse, ErrorResponse, OwnerModel, SuccessResponse } from "../../constants/response.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { catchError, finalize, Observable, of } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { CreateApplicationPayload, UpdateApplicationPayload } from "../../constants/model";
import { Environment, isSuccessResponse, toErrorResponse } from "../../constants/schema";
import { PageLoader } from "../../shared/page-loader";
import { LoadingButton } from "../../shared/loading-button";

@Component({
  selector: "app-application-form",
  imports: [RouterLink, FormField, PageHeader, PageLoader, LoadingButton],
  templateUrl: "./application-form.html",
})
export class ApplicationForm implements OnInit {
  /** Set `data: { mode: 'edit' }` on the edit route (needs withComponentInputBinding()). */
  readonly mode = input<"create" | "edit">("create");
  /** The :id route param in edit mode. */
  readonly id = input<string>();
  private owner = inject(ApplicationOwnerService)
  private service = inject(ApplicationService);
  private destroyRef = inject(DestroyRef)
   loading = signal(false);
  loadingOwner = signal(false);
  private router = inject(Router)

  protected readonly isEdit = computed(() => this.mode() === "edit");

  protected readonly clientOptions= signal<OwnerModel[]>([])
  protected readonly environmentOptions = ["DEVELOPMENT", "STAGING", "PRODUCTION"]
  protected readonly statusOptions = ["Active", "Inactive", "Pending"];

  private readonly model = signal<CreateApplicationPayload>({
    name: "",
    supportMail: "",
    ownerId: "",
    environment: "",
    redirectUrl: "",
    description: "",
    applicationStatus: ""
  });

  protected readonly f = form(this.model, (p) => {
    required(p.name, { message: "Name is required." });
    required(p.supportMail, { message: "Key is required." });
    required(p.ownerId, { message: "Client is required." });
    required(p.environment, { message: "Environment is required." });
    required(p.redirectUrl, { message: "Redirect URL is required." });
    required(p.applicationStatus, { message: "Status is required." });
  });

  ngOnInit(): void {
  this.getAll();

  const id = this.id();
  if (this.isEdit() && id) {
    this.loadApplication(id);
  }
}

private loadApplication(id: string) {
    this.loadingOwner.set(true);
  this.service.getById(id)
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(toErrorResponse),
        finalize(()=> this.loadingOwner.set(false))
    )
    .subscribe((response) => {
      console.log('Response: ', response)
      if (isSuccessResponse(response)) {
        // adjust to your response shape
        const app = (response as any).data;
        console.log('App: ', app)
        this.model.set({
          name: app.name,
          supportMail: app.supportMail,
          ownerId: app.ownerId,
          environment: app.environment,
          redirectUrl: app.redirectUrl,
          description: app.description ?? '',
          applicationStatus: app.applicationStatus,
        });
      }
    });
}

protected save(event: Event) {
  event.preventDefault();

  submit(this.f, async () => {
    const {
      name,
      supportMail,
      ownerId,
      description,
      environment,
      redirectUrl,
      applicationStatus,
    } = this.model();

    const payload: CreateApplicationPayload = {
      name,
      supportMail,
      ownerId,
      description,
      environment,
      redirectUrl,
      applicationStatus,
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
        console.log("Create Respone: ", response)
        if (isSuccessResponse(response)) {
          this.router.navigate(['applications']);
        }
      });
  });
}

  getAll(){
    const isApiResponse = (r: ApiResponse<OwnerModel[]> | ErrorResponse | null): r is ApiResponse<OwnerModel[]> => r !== null && r.statusCode === 200;
    this.owner.getAll().pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => of<ErrorResponse>({
        statusCode: err.status || 500,
       message: err.error?.message ?? 'Something went wrong. Please try again.',
      error: err.error
      }))
    ).subscribe((response) => {
      if(isApiResponse(response) && response !== null){
        this.clientOptions.set(response.data ?? [])
        console.log('Response: ', response.data)
      }
    })
  }
}
