import { Component } from '@angular/core';
import { NfsePagePlaceholderComponent } from '../../components/nfse-page-placeholder/nfse-page-placeholder';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [NfsePagePlaceholderComponent],
  templateUrl: './dashboard-page.html',
})
export class DashboardPageComponent {}
