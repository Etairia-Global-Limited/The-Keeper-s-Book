import { Component, DestroyRef, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormField, form } from "@angular/forms/signals";
import { PageHeader } from "../../shared/page-header";
import { StatusBadge } from "../../shared/status-badge";
import { ClientRow, ErrorResponse, MetaResponse, PaginatedResponse } from "../../constants/response.model";
import { ApplicationOwnerService } from "../../services/application-owner/application-owner-service";
import { SearchPayload } from "../../constants/model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { catchError, of } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-client-list",
  imports: [RouterLink, FormField, PageHeader, StatusBadge],
  templateUrl: "./client-list.html",
})
export class ClientList {
  private service = inject(ApplicationOwnerService);
  private destroyRef = inject(DestroyRef)
  protected readonly filterOptions = ["All statuses", "Active", "Inactive"];

  private readonly filterModel = signal({ search: "", filter: "All statuses" });
  protected readonly filters = form(this.filterModel);

  // TODO: replace the sample rows with your API data
  protected readonly rows = signal<ClientRow[]>([]);

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
    const isApiResponse = (r: PaginatedResponse<any> | ErrorResponse): r is PaginatedResponse<any> => r.statusCode === 200
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
        this.meta.set(response.meta)
      }
    })
  }

  protected remove(row: ClientRow) {
    // TODO: call your service for "Delete" on row.id
  }
}
