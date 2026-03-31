import { Component, input } from '@angular/core';

@Component({
  selector: 'app-nfse-page-placeholder',
  standalone: true,
  templateUrl: './nfse-page-placeholder.html',
})
export class NfsePagePlaceholderComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
