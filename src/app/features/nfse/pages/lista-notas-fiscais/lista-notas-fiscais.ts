import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { ListaNotasFiscaisFacade } from './facades/lista-notas-fiscais.facade';
import { NotaFiscalItemResponse } from '../../data-access/models/nfse-api.models';

@Component({
  selector: 'app-lista-notas-fiscais',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './lista-notas-fiscais.html',
  styleUrl: './lista-notas-fiscais.scss',
  providers: [ListaNotasFiscaisFacade],
})
export class ListaNotasFiscaisComponent implements OnInit {
  protected readonly facade = inject(ListaNotasFiscaisFacade);
  protected readonly expandedId = signal<string | null>(null);

  ngOnInit(): void {
    this.facade.loadPage();
  }

  protected nextPage(): void {
    this.facade.nextPage();
  }

  protected previousPage(): void {
    this.facade.previousPage();
  }

  protected toggleAccordion(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  protected isExpanded(id: string): boolean {
    return this.expandedId() === id;
  }

  protected getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'autorizada':
      case 'authorized':
        return 'text-bg-success';
      case 'cancelada':
        return 'text-bg-danger';
      case 'pendente':
        return 'text-bg-warning';
      case 'rejeitada':
      case 'rejected':
        return 'text-bg-danger';
      case 'error':
        return 'text-bg-danger';
      default:
        return 'text-bg-secondary';
    }
  }

  protected hasEventos(item: NotaFiscalItemResponse): boolean {
    return (item.erros?.length ?? 0) > 0 || (item.alertas?.length ?? 0) > 0;
  }
}
