import { Component, DestroyRef, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormField, form } from "@angular/forms/signals";
import { PageHeader } from "../../shared/page-header";
import { StatusBadge } from "../../shared/status-badge";
import { ApplicationService } from "../../services/application/application-service";
import { SearchPayload } from "../../constants/model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { catchError, finalize, of } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { ApiResponse, ApplicationRow, ErrorResponse, MetaResponse, PaginatedResponse } from "../../constants/response.model";
import { TableSkeleton } from "../../shared/table-skeleton";

@Component({
  selector: "app-application-list",
  imports: [RouterLink, FormField, PageHeader, StatusBadge, TableSkeleton],
  templateUrl: "./application-list.html",
})
export class ApplicationList {
  private service = inject(ApplicationService);
  private destroyRef = inject(DestroyRef)
  protected readonly filterOptions = ["All statuses", "Active", "Inactive"];
  loading = signal(false);

  private readonly filterModel = signal({ search: "", filter: "All statuses" });
  protected readonly filters = form(this.filterModel);

  // TODO: replace the sample rows with your API data
  protected readonly rows = signal<ApplicationRow[]>([
  ]);

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
        this.meta.set(response.meta)
      }
    })
  }


  protected remove(row: ApplicationRow) {
    // TODO: call your service for "Delete" on row.id
  }
}
