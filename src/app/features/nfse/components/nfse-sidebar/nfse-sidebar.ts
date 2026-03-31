import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

type NfseNavigationItem = {
  label: string;
  route: string;
  exact?: boolean;
};

@Component({
  selector: 'app-nfse-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nfse-sidebar.html',
  styleUrl: './nfse-sidebar.scss',
})
export class NfseSidebarComponent {
  protected readonly navigationItems: NfseNavigationItem[] = [
    { label: 'Dashboard', route: '/nfse/dashboard' },
    { label: 'Consulta NFSe', route: '/nfse/consulta-nfse' },
    { label: 'Emissao NFSe', route: '/nfse/emissao-nfse' },
    { label: 'Cancelamento NFSe', route: '/nfse/cancelamento-nfse' },
    { label: 'Consulta Lotes', route: '/nfse/consulta-lotes' },
    { label: 'Configuracoes NFSe', route: '/nfse/configuracoes-nfse' },
  ];
}
