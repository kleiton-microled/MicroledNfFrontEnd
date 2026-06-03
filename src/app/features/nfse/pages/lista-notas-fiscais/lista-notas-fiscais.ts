import { Component, inject, OnInit } from '@angular/core';
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

  ngOnInit(): void {
    this.facade.loadPage();
  }

  protected nextPage(): void {
    this.facade.nextPage();
  }

  protected previousPage(): void {
    this.facade.previousPage();
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
        return 'text-bg-danger';
      default:
        return 'text-bg-secondary';
    }
  }

  protected hasEventos(item: NotaFiscalItemResponse): boolean {
    return (item.erros?.length ?? 0) > 0 || (item.alertas?.length ?? 0) > 0;
  }

  protected buildTooltipLines(item: NotaFiscalItemResponse): string[] {
    const lines: string[] = [];
    for (const e of item.erros ?? []) {
      lines.push(`[ERRO ${e.codigo}] ${e.descricao}`);
    }
    for (const a of item.alertas ?? []) {
      lines.push(`[ALERTA ${a.codigo}] ${a.descricao}`);
    }
    return lines;
  }
}
