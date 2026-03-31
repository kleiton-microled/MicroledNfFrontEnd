import { Routes } from '@angular/router';
import { NfseLayoutComponent } from './layout/nfse-layout/nfse-layout';

export const NFSE_ROUTES: Routes = [
  {
    path: '',
    component: NfseLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard-page').then((m) => m.DashboardPageComponent),
      },
      {
        path: 'consulta-nfse',
        loadComponent: () =>
          import('./pages/consulta-nfse/consulta-nfse-page').then(
            (m) => m.ConsultaNfsePageComponent,
          ),
      },
      {
        path: 'emissao-nfse',
        loadComponent: () =>
          import('./pages/emissao-nfse/emissao-nfse-page').then((m) => m.EmissaoNfsePageComponent),
      },
      {
        path: 'cancelamento-nfse',
        loadComponent: () =>
          import('./pages/cancelamento-nfse/cancelamento-nfse-page').then(
            (m) => m.CancelamentoNfsePageComponent,
          ),
      },
      {
        path: 'consulta-lotes',
        loadComponent: () =>
          import('./pages/consulta-lotes/consulta-lotes-page').then(
            (m) => m.ConsultaLotesPageComponent,
          ),
      },
      {
        path: 'configuracoes-nfse',
        loadComponent: () =>
          import('./pages/configuracoes-nfse/configuracoes-nfse-page').then(
            (m) => m.ConfiguracoesNfsePageComponent,
          ),
      },
    ],
  },
];
