import { Component, computed, DestroyRef, inject, input, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { FormField, form, required, submit } from "@angular/forms/signals";
import { PageHeader } from "../../shared/page-header";
import { ApplicationService } from "../../services/application/application-service";
import { ApplicationRoleService } from "../../services/application-role/application-role-service";
import { ApiResponse, ErrorResponse, SuccessResponse } from "../../constants/response.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { catchError, finalize, Observable, of } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { isSuccessResponse, toErrorResponse } from "../../constants/schema";
import { CreateRolePayload } from "../../constants/model";
import { LoadingButton } from "../../shared/loading-button";
import { PageLoader } from "../../shared/page-loader";

@Component({
  selector: "app-application-role-form",
  imports: [RouterLink, FormField, PageHeader, LoadingButton, PageLoader],
  templateUrl: "./application-role-form.html",
})
export class ApplicationRoleForm {
  /** Set `data: { mode: 'edit' }` on the edit route (needs withComponentInputBinding()). */
  readonly mode = input<"create" | "edit">("create");
  /** The :id route param in edit mode. */
  readonly id = input<string>();
  private appService = inject(ApplicationService)
  private service = inject(ApplicationRoleService);
  private destroyRef = inject(DestroyRef)
  loading = signal(false);
  loadingOwner = signal(false);
  private router = inject(Router);

  protected readonly isEdit = computed(() => this.mode() === "edit");

  protected readonly applicationOptions = signal<any[]>([])
  protected readonly statusOptions = ["Active", "Inactive", "Pending"];

  private readonly model = signal({
  "name": "",
  "description": "",
  "applicationId": ""
  });

  protected readonly f = form(this.model, (p) => {
    required(p.name, { message: "Role name is required." });
    required(p.applicationId, { message: "Application is required." });
    required(p.description , { message: "Status is required." });
  });

      ngOnInit(): void {
  this.getApp();

  const id = this.id();
  if (this.isEdit() && id) {
    this.loadOwner(id);
  }
}

  private loadOwner(id: string) {
    this.loadingOwner.set(true);
    this.service.getById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(toErrorResponse),
        finalize(()=> this.loadingOwner.set(false))
      )
      .subscribe((response) => {
        if (isSuccessResponse(response)) {
          // adjust to your response shape
          const app = (response as any).data;
          console.log('App: ', app)
          this.model.set({
            name: app.name,
            description: app.description,
            applicationId: app.applicationId
          });
        }
      });
  }

    getApp(){
     const isApiResponse = (r: ApiResponse<any> | ErrorResponse): r is ApiResponse<any> => r.statusCode === 200
    this.appService.getAll().pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => of<ErrorResponse>({
        statusCode: err.status || 500,
      message: err.error?.message ?? 'Something went wrong. Please try again.',
      error: err.error
      }))
    ).subscribe((response) => {
      if(isApiResponse(response)){
        console.log('Response: ', response.data)
        this.applicationOptions.set(response.data)
        // this.meta.set(response.meta)
      }
    })
  }

  // TODO (edit mode): load the record for id() and call this.model.set(...) with it.

protected save(event: Event) {
  event.preventDefault();

  submit(this.f, async () => {
    const {
                name,
                applicationId,
                description
    } = this.model();

    const payload: CreateRolePayload = {
      name,
      applicationId,
      description
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
          this.router.navigate(['application-roles']);
        }
      });
  });
}
}
