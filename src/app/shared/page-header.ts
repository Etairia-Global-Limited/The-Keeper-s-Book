import { Component, input } from "@angular/core";

@Component({
  selector: "app-page-header",
  templateUrl: "./page-header.html",
})
export class PageHeader {
  readonly heading = input.required<string>();
  readonly subtitle = input<string>("");
}
