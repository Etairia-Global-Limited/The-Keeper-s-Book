import { Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormField, form, required, submit } from '@angular/forms/signals';
import { PageHeader } from '../../shared/page-header';
import { ApplicationUserService } from '../../services/application-user/application-user-service';
import { UserService } from '../../services/user/user-service';
import { ApplicationRoleService } from '../../services/application-role/application-role-service';
import { KycService } from '../../services/kyc/kyc-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, Observable, of } from 'rxjs';
import { isApiResponse, isSuccessResponse, toErrorResponse } from '../../constants/schema';
import { ApiResponse, ErrorResponse, SuccessResponse } from '../../constants/response.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ApplicationService } from '../../services/application/application-service';
import { CreateAppUserPayload, PasswordOptions } from '../../constants/model';
import { SharedState } from '../../services/common/shared';

@Component({
  selector: 'app-application-user-form',
  imports: [RouterLink, FormField, PageHeader],
  templateUrl: './application-user-form.html',
})
export class ApplicationUserForm {
  /** Set `data: { mode: 'edit' }` on the edit route (needs withComponentInputBinding()). */
  readonly mode = input<'create' | 'edit'>('create');
  /** The :id route param in edit mode. */
  readonly id = input<string>();
  private service = inject(ApplicationUserService);
  private appService = inject(ApplicationService);
  private userService = inject(UserService);
  private appRole = inject(ApplicationRoleService);
  private kycService = inject(KycService);
  private destroyRef = inject(DestroyRef);
  private loading = signal(false);
  private router = inject(Router);
  private shared = inject(SharedState)

  protected readonly isEdit = computed(() => this.mode() === 'edit');

  protected readonly userOptions = signal<any[]>([]);
  protected readonly applicationOptions = signal<any[]>([]);
  protected readonly roleOptions = signal<any[]>([]);
  protected readonly countryCode = signal<any[]>([]);

  private readonly model = signal({
    applicationId: '',
    userId: '',
    roleId: '',
    countryCode: '',
  });

  protected readonly f = form(this.model, (p) => {
    required(p.userId, { message: 'User is required.' });
    required(p.applicationId, { message: 'Application is required.' });
    required(p.roleId, { message: 'Role is required.' });
    required(p.countryCode, { message: 'Status is required.' });
  });


      ngOnInit(): void {
  this.getApp();
  this.getCountry()
  this.getUser()

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
        if (isApiResponse(response)) {
          // adjust to your response shape
          const app = (response as any).data;
          console.log('App: ', app)
          this.model.set({
            applicationId: app.applicationId,
    userId: app.userId,
    roleId: app.roleId,
    countryCode: app.countryCode,
          });
          
          this.getRole(app.applicationId)
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
        this.countryCode.set(response.data)
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
        this.roleOptions.set(response.data ?? [])
      }
    })
  }

      getUser(){
    this.userService.getAll().pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => of<ErrorResponse>({
        statusCode: err.status || 500,
      message: err.error?.message ?? 'Something went wrong. Please try again.',
      error: err.error
      }))
    ).subscribe((response) => {
      if(isApiResponse(response)){
        console.log('Response: ', response.data)
        this.userOptions.set(response.data ?? [])
      }
    })
  }

protected save(event: Event) {
  event.preventDefault();

  submit(this.f, async () => {
    const {
                userId,
                applicationId,
                roleId,
                countryCode

    } = this.model();

     const options: PasswordOptions = {
    length: 16,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
  };

    const payload: CreateAppUserPayload = {
      userId,
      applicationId,
      roleId,
      countryCode,
      password: this.shared.generate(options)
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
          this.router.navigate(['application-users']);
        }
      });
  });
}
}
