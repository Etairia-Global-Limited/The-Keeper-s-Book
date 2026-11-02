import { Component, DestroyRef, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormField, form } from "@angular/forms/signals";
import { PageHeader } from "../../shared/page-header";
import { StatusBadge } from "../../shared/status-badge";
import { ErrorResponse, MetaResponse, PaginatedResponse, UserRow } from "../../constants/response.model";
import { UserService } from "../../services/user/user-service";
import { SearchPayload } from "../../constants/model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { HttpErrorResponse } from "@angular/common/http";
import { catchError, of } from "rxjs";
import { isPaginatedResponse, isSuccessResponse, toErrorResponse } from "../../constants/schema";

@Component({
  selector: "app-user-list",
  imports: [RouterLink, FormField, PageHeader, StatusBadge],
  templateUrl: "./user-list.html",
})
export class UserList {
  private service = inject(UserService);
  private destroyRef = inject(DestroyRef);
  protected readonly filterOptions = ["All statuses", "Active", "Suspended", "Pending"];

  private readonly filterModel = signal({ search: "", filter: "All statuses" });
  protected readonly filters = form(this.filterModel);

  // TODO: replace the sample rows with your API data
  protected readonly rows = signal<UserRow[]>([]);

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
    this.service.search(payload).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => of<ErrorResponse>({
        statusCode: err.status || 500,
      message: err.error?.message ?? 'Something went wrong. Please try again.',
      error: err.error
      }))
    ).subscribe((response) => {
      if(isPaginatedResponse(response)){
        console.log('Response: ', response.data)
        this.rows.set(response.data)
        this.meta.set(response.meta)
      }
    })
  }

  protected suspend(row: UserRow) {
    this.service.deactivate({id: row.id}).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((toErrorResponse))
    ).subscribe((response) => {
      if(isSuccessResponse(response)){
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
    })
  }
  
  protected restore(row: UserRow) {
    this.service.activate({id: row.id}).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((toErrorResponse))
    ).subscribe((response) => {
      if(isSuccessResponse(response)){
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
    })
  }

}

