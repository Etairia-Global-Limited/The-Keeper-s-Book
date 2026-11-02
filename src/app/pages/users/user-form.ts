import { Component, computed, DestroyRef, inject, input, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { FormField, email, form, required, submit } from "@angular/forms/signals";
import { PageHeader } from "../../shared/page-header";
import { UserService } from "../../services/user/user-service";
import { ApplicationService } from "../../services/application/application-service";
import { ApplicationRoleService } from "../../services/application-role/application-role-service";
import { ApplicationOwnerService } from "../../services/application-owner/application-owner-service";
import { KycService } from "../../services/kyc/kyc-service";
import { SharedState } from "../../services/common/shared";
import { ApiResponse, ErrorResponse } from "../../constants/response.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { catchError, finalize, Observable, of } from "rxjs";
import { isApiResponse, isSuccessResponse, toErrorResponse } from "../../constants/schema";
import { HttpErrorResponse } from "@angular/common/http";
import { CreateUserPayload, PasswordOptions } from "../../constants/model";

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
  private service = inject(UserService);
  private appService = inject(ApplicationService);
  private appRole = inject(ApplicationRoleService);
  private client = inject(ApplicationOwnerService);
   private kycService = inject(KycService);
  private destroyRef = inject(DestroyRef);
  private loading = signal(false);
  private router = inject(Router);
  private shared = inject(SharedState)

  protected readonly isEdit = computed(() => this.mode() === "edit");
  country = signal<any[]>([]);
  clients = signal<any[]>([]);
  application = signal<any[]>([]);
  role = signal<any[]>([]);

  private readonly model = signal({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    roleId: "",
    phoneNumber: "",
    address: "",
    countryCode: "",
    applicationId: "",
  });

  protected readonly f = form(this.model, (p) => {
    required(p.firstName, { message: "First name is required." });
    required(p.lastName, { message: "Last name is required." });
    required(p.email, { message: "Email is required." });
    email(p.email, { message: "Enter a valid email address." });
    required(p.username, { message: "Username is required." });
    required(p.roleId, { message: "Role is required." });
    required(p.phoneNumber, { message: "Phone Number is required." });
    required(p.address, { message: "Address is required." });
    required(p.countryCode, { message: "Country Code is required." });
    required(p.applicationId, { message: "Application is required." });
  });


      ngOnInit(): void {
  this.getApp();
  this.getCountry()
  this.getClient()

}

    getApp(){
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
        this.application.set(response.data)
      }
    })
  }

    getCountry(){
     const isApiResponse = (r: ApiResponse<any> | ErrorResponse): r is ApiResponse<any> => r.statusCode === 200
    this.kycService.getCountries().pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => of<ErrorResponse>({
        statusCode: err.status || 500,
      message: err.error?.message ?? 'Something went wrong. Please try again.',
      error: err.error
      }))
    ).subscribe((response) => {
      if(isApiResponse(response)){
        console.log('Response: ', response.data)
        this.country.set(response.data)
      }
    })
  }

      getRole(id: string){
    this.appRole.getByApplicationId(id).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => of<ErrorResponse>({
        statusCode: err.status || 500,
      message: err.error?.message ?? 'Something went wrong. Please try again.',
      error: err.error
      }))
    ).subscribe((response) => {
      if(isApiResponse(response)){
        console.log('Response: ', response.data)
        this.role.set(response.data ?? [])
      }
    })
  }

      getClient(){
    this.client.getAll().pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => of<ErrorResponse>({
        statusCode: err.status || 500,
      message: err.error?.message ?? 'Something went wrong. Please try again.',
      error: err.error
      }))
    ).subscribe((response) => {
      if(isApiResponse(response)){
        console.log('Response: ', response.data)
        this.clients.set(response.data ?? [])
      }
    })
  }

protected save(event: Event) {
  event.preventDefault();

  submit(this.f, async () => {
    const {
                firstName,
                lastName,
                email,
                username,
                roleId,
                phoneNumber,
                address,
                countryCode,
                applicationId,

    } = this.model();

     const options: PasswordOptions = {
    length: 16,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
  };

    const payload: CreateUserPayload = {
      firstName,
                lastName,
                email,
                username,
                roleId,
                phoneNumber,
                address,
                countryCode,
                applicationId,
      password: this.shared.generate(options)
    };

    this.loading.set(true);

    this.service.create(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(toErrorResponse),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((response) => {
        if (isSuccessResponse(response)) {
          this.router.navigate(['users']);
        }
      });
  });
}
}
