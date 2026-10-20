import { Component, DestroyRef, inject, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { FormField, email, form, required, submit } from "@angular/forms/signals";
import { AuthService } from "../../services/auth/auth-service";
import { LoginPayload } from "../../constants/model";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, of } from "rxjs";
import { ApiResponse, ErrorResponse, LoginResopnse } from "../../constants/response.model";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-login",
  imports: [RouterLink, FormField],
  templateUrl: "./login.html",
})
export class Login {
  protected readonly showPassword = signal(false);
  private service = inject(AuthService);
  private destroyRef = inject(DestroyRef)
  error = signal<string | null>('')
  loading = signal(false)
  private router = inject(Router)

  private readonly model = signal({ email: "", password: "", remember: false });

  protected readonly f = form(this.model, (p) => {
    required(p.email, { message: "Enter your email address." });
    email(p.email, { message: "Enter a valid email address." });
    required(p.password, { message: "Enter your password." });
  });

  protected readonly features = [
    "Roles and permissions for every application",
    "KYC document review for each user",
    "A complete audit trail of every action",
  ];

  protected signIn(event: Event) {
    event.preventDefault();
    this.loading.set(true)
    submit(this.f, async () => {
      const value = this.model();

      const payload: LoginPayload = {
        usernameOrEmail: value.email,
        password: value.password
      }

      const isLoginSuccess = (r: LoginResopnse | ErrorResponse): r is LoginResopnse => r.statusCode === 200;

      this.service.login(payload).pipe(
  takeUntilDestroyed(this.destroyRef),
  catchError((err: HttpErrorResponse) =>
    of<ErrorResponse>({
      statusCode: err.status || 500,
      message: err.error?.message ?? 'Something went wrong. Please try again.',
      error: err.error
    }),
  ),
    finalize(() => {
      this.loading.set(false)
    })
).subscribe((response) => {
  console.log("Response: ", response)
  if (isLoginSuccess(response)) {
    this.error.set(null);
    this.router.navigateByUrl('/dashboard');
  } else {
    this.error.set(response.message);
  }
});
    });
  }
}
