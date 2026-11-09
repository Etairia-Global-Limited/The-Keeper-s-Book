import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { catchError, of, finalize } from 'rxjs';
import { CreateApplicationClientPayload } from '../../constants/model';
import { ErrorResponse } from '../../constants/response.model';
import { toErrorResponse, isSuccessResponse } from '../../constants/schema';
import { ApplicationClientService } from '../../services/application-client/application-client-service';
import { ApplicationService } from '../../services/application/application-service';
import { Router } from '@angular/router';
import { PageLoader } from '../../shared/page-loader';
import { PageHeader } from '../../shared/page-header';
import { LoadingButton } from '../../shared/loading-button';

interface ApplicationOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-application-client-form',
  imports: [PageLoader, PageHeader, LoadingButton, FormField],
  templateUrl: './application-client-form.html',
  styleUrl: './application-client-form.css',
})
export class ApplicationClientForm implements OnInit {
  private readonly service = inject(ApplicationClientService);
  private readonly applications = inject(ApplicationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly loadingApplications = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly applicationOptions = signal<ApplicationOption[]>([]);

  /** Set only if the backend returns the plaintext secret once, right after creation. */
  protected readonly createdSecret = signal<string | null>(null);
  protected readonly copied = signal(false);

  private readonly model = signal<CreateApplicationClientPayload>({
    clientId: '',
    applicationId: '',
    description: '',
  });

  protected readonly f = form(this.model, (p) => {
    required(p.clientId, { message: 'Client ID is required.' });
    required(p.applicationId, { message: 'Application is required.' });
  });

  ngOnInit(): void {
    this.loadApplications();
  }

  private loadApplications(): void {
    this.loadingApplications.set(true);
    // Assumes ApplicationService has a getAll() returning { statusCode, data: [{ id, name }] }.
    // Adjust to whatever your service exposes (or use its search with a large pageSize).
    this.applications
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err: HttpErrorResponse) =>
          of<ErrorResponse>({
            statusCode: err.status || 500,
            message: err.error?.message ?? 'Could not load applications.',
            error: err.error,
          }),
        ),
        finalize(() => this.loadingApplications.set(false)),
      )
      .subscribe((response: any) => {
        if (response?.statusCode === 200) {
          this.applicationOptions.set(response.data ?? []);
        } else {
          this.submitError.set(response?.message ?? 'Could not load applications.');
        }
      });
  }

  protected save(event: Event): void {
    event.preventDefault();

    submit(this.f, async () => {
      const { clientId, applicationId, description } = this.model();
      const payload: CreateApplicationClientPayload = {
        clientId: clientId.trim(),
        applicationId,
        description: description.trim(),
      };

      this.submitError.set(null);
      this.loading.set(true);

      this.service
        .create(payload)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          catchError(toErrorResponse),
          finalize(() => this.loading.set(false)),
        )
        .subscribe((response) => {
          if (!isSuccessResponse(response)) {
            this.submitError.set(
              (response as ErrorResponse).message ?? 'Could not create the client.',
            );
            return;
          }
          const secret = (response as any).data?.secret;
          if (secret) {
            // Shown once; the backend will only hold a hash of it.
            this.createdSecret.set(secret);
          } else {
            this.router.navigate(['application-clients']);
          }
        });
    });
  }

  protected async copySecret(): Promise<void> {
    const secret = this.createdSecret();
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      this.copied.set(false);
    }
  }

  protected done(): void {
    this.createdSecret.set(null);
    this.router.navigate(['application-clients']);
  }
}
