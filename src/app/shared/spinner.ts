import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.html',
})
export class Spinner {
  readonly size = input<'sm' | 'md' | 'lg'>('sm');
  readonly label = input('Loading');
}