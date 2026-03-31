import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NfseSidebarComponent } from '../../components/nfse-sidebar/nfse-sidebar';

@Component({
  selector: 'app-nfse-layout',
  standalone: true,
  imports: [RouterOutlet, NfseSidebarComponent],
  templateUrl: './nfse-layout.html',
  styleUrl: './nfse-layout.scss',
})
export class NfseLayoutComponent {}
