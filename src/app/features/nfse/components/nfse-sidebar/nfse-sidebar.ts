import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

type NfseNavigationItem = {
  label: string;
  route: string;
  icon: string;
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
  protected readonly collapsed = signal(false);

  protected readonly navigationItems: NfseNavigationItem[] = [
    { label: 'Dashboard', route: '/nfse/dashboard', icon: 'bi-speedometer2' },
    { label: 'Lista de NFs', route: '/nfse/lista-notas-fiscais', icon: 'bi-receipt' },
    { label: 'Emissao NFSe', route: '/nfse/emissao-nfse', icon: 'bi-file-earmark-plus' },
    { label: 'Consulta NFSe', route: '/nfse/consulta-nfse', icon: 'bi-search' },
    { label: 'Cancelamento NFSe', route: '/nfse/cancelamento-nfse', icon: 'bi-x-circle' },
    { label: 'Configuracoes', route: '/nfse/configuracoes-nfse', icon: 'bi-gear' },
  ];

  protected toggleCollapse(): void {
    this.collapsed.update(v => !v);
  }
}
