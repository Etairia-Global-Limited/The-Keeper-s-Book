import { Component, DestroyRef, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormField, form } from "@angular/forms/signals";
import { PageHeader } from "../../shared/page-header";
import { StatusBadge } from "../../shared/status-badge";
import { ApiResponse, ApplicationUserRow, ErrorResponse, MetaResponse, PaginatedResponse } from "../../constants/response.model";
import { ApplicationService } from "../../services/application/application-service";
import { ApplicationUserService } from "../../services/application-user/application-user-service";
import { SearchPayload } from "../../constants/model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { catchError, of } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-application-user-list",
  imports: [RouterLink, FormField, PageHeader, StatusBadge],
  templateUrl: "./application-user-list.html",
})
export class ApplicationUserList {
  private appService = inject(ApplicationService);
  private service = inject(ApplicationUserService);
  private destroyRef = inject(DestroyRef);

  protected readonly filterOptions = signal<any[]>([]);

  private readonly filterModel = signal({ search: "", filter: "All applications" });
  protected readonly filters = form(this.filterModel);

  // TODO: replace the sample rows with your API data
  protected readonly rows = signal<ApplicationUserRow[]>([]);

   meta = signal<MetaResponse>({
      total: 0,
      page: 0,
      pageSize:0,
      totalPages: 0
    })

     ngOnInit():void{
    const payload: SearchPayload = {
      page: 1,
      pageSize: 10,
      sortBy: "",
      sortOrder: '',
      filter: '',
      keyword:''
    }
    this.search(payload)
    this.getApp()
  }

  search(payload: SearchPayload){
    const isApiResponse = (r: PaginatedResponse<ApplicationUserRow[]> | ErrorResponse): r is PaginatedResponse<any> => r.statusCode === 200
    this.service.search(payload).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => of<ErrorResponse>({
        statusCode: err.status || 500,
      message: err.error?.message ?? 'Something went wrong. Please try again.',
      error: err.error
      }))
    ).subscribe((response) => {
      if(isApiResponse(response)){
        console.log('Response: ', response.data)
        this.rows.set(response.data)
      }
    })
  }

  getApp(){
     const isApiResponse = (r: ApiResponse<any> | ErrorResponse): r is PaginatedResponse<any> => r.statusCode === 200
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
        this.filterOptions.set(response.data)
        // this.meta.set(response.meta)
      }
    })
  }

  protected revoke(row: ApplicationUserRow) {
    // TODO: call your service for "Revoke" on row.id
  }
}
