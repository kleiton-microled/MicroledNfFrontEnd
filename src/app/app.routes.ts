import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
  },
  {
    path: 'nfse',
    loadChildren: () => import('./features/nfse/nfse.routes').then((m) => m.NFSE_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
