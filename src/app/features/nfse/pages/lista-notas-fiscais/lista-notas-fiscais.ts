import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { ListaNotasFiscaisFacade } from './facades/lista-notas-fiscais.facade';
import { NfseApiService } from '../../data-access/services/nfse-api.service';
import { NfseApiError, NotaFiscalItemResponse, ConsultarStatusRpsResponse } from '../../data-access/models/nfse-api.models';
import { ReenvioNotaState } from './models/reenvio-nota-state';

interface RowDraft {
  pago: boolean;
  dataPagamento: string;
  valorDepositado: number | null;
}

@Component({
  selector: 'app-lista-notas-fiscais',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './lista-notas-fiscais.html',
  styleUrl: './lista-notas-fiscais.scss',
  providers: [ListaNotasFiscaisFacade],
})
export class ListaNotasFiscaisComponent implements OnInit {
  protected readonly facade = inject(ListaNotasFiscaisFacade);
  private readonly nfseApiService = inject(NfseApiService);
  private readonly router = inject(Router);

  protected readonly expandedId = signal<string | null>(null);
  protected readonly savingId = signal<string | null>(null);
  protected readonly savedId = signal<string | null>(null);
  protected readonly consultandoProtocoloId = signal<string | null>(null);
  protected readonly baixandoPdfId = signal<string | null>(null);
  protected readonly gerandoPdfId = signal<string | null>(null);
  protected readonly rowDrafts = new Map<string, RowDraft>();

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

  protected getDraft(item: NotaFiscalItemResponse): RowDraft {
    if (!this.rowDrafts.has(item.id)) {
      this.rowDrafts.set(item.id, {
        pago: item.pago ?? false,
        dataPagamento: item.dataPagamento
          ? new Date(item.dataPagamento).toISOString().substring(0, 10)
          : '',
        valorDepositado: item.valorDepositado ?? null,
      });
    }

    return this.rowDrafts.get(item.id)!;
  }

  protected onFieldChange(id: string, field: keyof RowDraft, value: unknown): void {
    const draft = this.rowDrafts.get(id);
    if (!draft) {
      return;
    }

    (draft as unknown as Record<string, unknown>)[field] = value;

    if (field === 'pago' && !value) {
      draft.dataPagamento = '';
      draft.valorDepositado = null;
    }
  }

  protected saveRow(item: NotaFiscalItemResponse): void {
    if (this.savingId() === item.id) {
      return;
    }

    const draft = this.rowDrafts.get(item.id);
    if (!draft) {
      return;
    }

    this.savingId.set(item.id);

    const body: { pago: boolean; dataPagamento?: string; valorDepositado?: number; alteradoPor: string } = {
      pago: draft.pago,
      alteradoPor: 'frontend',
    };

    if (draft.pago) {
      if (draft.dataPagamento) {
        body.dataPagamento = new Date(draft.dataPagamento).toISOString();
      }
      if (draft.valorDepositado !== null && draft.valorDepositado !== undefined) {
        body.valorDepositado = draft.valorDepositado;
      }
    }

    this.nfseApiService
      .atualizarPagamento(item.id, body)
      .pipe(finalize(() => this.savingId.set(null)))
      .subscribe({
        next: () => {
          this.savedId.set(item.id);
          setTimeout(() => {
            if (this.savedId() === item.id) {
              this.savedId.set(null);
            }
          }, 2000);
        },
        error: (error: unknown) => {
          const message = error instanceof NfseApiError
            ? error.message
            : 'Nao foi possivel salvar o pagamento.';
          alert(message);
        },
      });
  }

  protected getStatusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case 'authorized':
        return 'Autorizada';
      default:
        return status ?? '-';
    }
  }

  protected isAuthorized(status: string): boolean {
    const normalized = status?.toLowerCase();
    return normalized === 'authorized' || normalized === 'autorizada';
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

  protected consultarProtocolo(item: NotaFiscalItemResponse): void {
    if (!item.protocolo || !item.cnpjPrestador) {
      alert('Nota sem protocolo ou CNPJ do prestador — nao e possivel consultar.');
      return;
    }

    if (this.consultandoProtocoloId() === item.id) {
      return;
    }

    this.consultandoProtocoloId.set(item.id);

    this.nfseApiService
      .consultarStatusRps({ numeroProtocolo: item.protocolo, cnpjRemetente: item.cnpjPrestador })
      .pipe(finalize(() => this.consultandoProtocoloId.set(null)))
      .subscribe({
        next: (res: ConsultarStatusRpsResponse) => {
          if (res.sucesso) {
            this.facade.loadPage();
          } else {
            const erros = res.erros?.join('\n') ?? 'Erro desconhecido';
            alert(`Consulta retornou erro:\n${erros}`);
          }
        },
        error: (error: unknown) => {
          const message = error instanceof NfseApiError
            ? error.message
            : 'Nao foi possivel consultar o protocolo.';
          alert(message);
        },
      });
  }

  protected downloadPdf(item: NotaFiscalItemResponse): void {
    if (this.baixandoPdfId() === item.id) return;
    this.baixandoPdfId.set(item.id);

    this.nfseApiService
      .downloadPdfNotaFiscal(item.id)
      .pipe(finalize(() => this.baixandoPdfId.set(null)))
      .subscribe({
        next: (blob: Blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `nota-fiscal-${item.numeroNota ?? item.id}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        },
        error: (error: unknown) => {
          const message = error instanceof NfseApiError
            ? error.message
            : 'Nao foi possivel baixar o PDF.';
          alert(message);
        },
      });
  }

  protected gerarPdf(item: NotaFiscalItemResponse): void {
    if (this.gerandoPdfId() === item.id) return;
    this.gerandoPdfId.set(item.id);

    this.nfseApiService
      .gerarPdfNotaFiscal(item.id)
      .pipe(finalize(() => this.gerandoPdfId.set(null)))
      .subscribe({
        next: (blob: Blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `nota-fiscal-${item.numeroNota ?? item.id}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          this.facade.loadPage();
        },
        error: (error: unknown) => {
          const message = error instanceof NfseApiError
            ? error.message
            : 'Nao foi possivel gerar o PDF.';
          alert(message);
        },
      });
  }

  protected reenviarNota(item: NotaFiscalItemResponse): void {
    const state: ReenvioNotaState = {
      numeroRps: item.numeroRps,
      serieRps: item.serieRps,
      cpfCnpjTomador: item.cpfCnpjTomador,
      dataEmissao: item.dataEmissao
        ? item.dataEmissao.substring(0, 10)
        : undefined,
    };

    void this.router.navigate(['/nfse/emissao-nfse'], { state: { reenvio: state } });
  }
}
