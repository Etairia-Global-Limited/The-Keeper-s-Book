import { Component, DestroyRef, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormField, form } from "@angular/forms/signals";
import { PageHeader } from "../../shared/page-header";
import { StatusBadge } from "../../shared/status-badge";
import { ApplicationService } from "../../services/application/application-service";
import { ApplicationRoleService } from "../../services/application-role/application-role-service";
import { ApiResponse, ApplicationRoleRow, ErrorResponse, MetaResponse, PaginatedResponse } from "../../constants/response.model";
import { SearchPayload } from "../../constants/model";
import { catchError, finalize, of } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TableSkeleton } from "../../shared/table-skeleton";



@Component({
  selector: "app-application-role-list",
  imports: [RouterLink, FormField, PageHeader, StatusBadge, TableSkeleton],
  templateUrl: "./application-role-list.html",
})
export class ApplicationRoleList {
  private appService = inject(ApplicationService);
  private service = inject(ApplicationRoleService);
  private destroyRef = inject(DestroyRef);
  loading = signal(false);

  protected readonly filterOptions = signal<any[]>([]);

  private readonly filterModel = signal({ search: "", filter: "All applications" });
  protected readonly filters = form(this.filterModel);

  // TODO: replace the sample rows with your API data
  protected readonly rows = signal<ApplicationRoleRow[]>([]);

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
    this.loading.set(true);
    const isApiResponse = (r: PaginatedResponse<any> | ErrorResponse): r is PaginatedResponse<any> => r.statusCode === 200
    this.service.search(payload).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => of<ErrorResponse>({
        statusCode: err.status || 500,
      message: err.error?.message ?? 'Something went wrong. Please try again.',
      error: err.error
      })),
      finalize(() => this.loading.set(false))
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


  protected remove(row: ApplicationRoleRow) {
    // TODO: call your service for "Delete" on row.id
  }
}
