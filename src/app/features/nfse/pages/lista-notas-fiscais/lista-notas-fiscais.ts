import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { ListaNotasFiscaisFacade } from './facades/lista-notas-fiscais.facade';
import { NfseApiService } from '../../data-access/services/nfse-api.service';
import { NfseApiError, NotaFiscalItemResponse, ConsultarStatusRpsResponse } from '../../data-access/models/nfse-api.models';
import { ReenvioNotaState } from './models/reenvio-nota-state';

interface ModalDraft {
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

  @ViewChild('editDialog') private editDialog!: ElementRef<HTMLDialogElement>;

  protected readonly expandedId = signal<string | null>(null);
  protected readonly consultandoProtocoloId = signal<string | null>(null);
  protected readonly deletingId = signal<string | null>(null);
  protected readonly editingItem = signal<NotaFiscalItemResponse | null>(null);
  protected readonly modalSaving = signal(false);
  protected modalDraft: ModalDraft = { pago: false, dataPagamento: '', valorDepositado: null };

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

  protected openEditModal(item: NotaFiscalItemResponse): void {
    this.editingItem.set(item);
    this.modalDraft = {
      pago: item.pago ?? false,
      dataPagamento: item.dataPagamento
        ? new Date(item.dataPagamento).toISOString().substring(0, 10)
        : '',
      valorDepositado: item.valorDepositado ?? null,
    };
    this.editDialog.nativeElement.showModal();
  }

  protected closeModal(): void {
    this.editDialog.nativeElement.close();
    this.editingItem.set(null);
  }

  protected onModalPagoChange(pago: boolean): void {
    this.modalDraft.pago = pago;
    if (!pago) {
      this.modalDraft.dataPagamento = '';
      this.modalDraft.valorDepositado = null;
    }
  }

  protected saveModal(): void {
    const item = this.editingItem();
    if (!item || this.modalSaving()) return;

    this.modalSaving.set(true);

    const body: { pago: boolean; dataPagamento?: string; valorDepositado?: number; alteradoPor: string } = {
      pago: this.modalDraft.pago,
      alteradoPor: 'frontend',
    };

    if (this.modalDraft.pago) {
      if (this.modalDraft.dataPagamento) {
        body.dataPagamento = new Date(this.modalDraft.dataPagamento).toISOString();
      }
      if (this.modalDraft.valorDepositado !== null && this.modalDraft.valorDepositado !== undefined) {
        body.valorDepositado = this.modalDraft.valorDepositado;
      }
    }

    this.nfseApiService
      .atualizarPagamento(item.id, body)
      .pipe(finalize(() => this.modalSaving.set(false)))
      .subscribe({
        next: () => {
          this.closeModal();
          this.facade.loadPage();
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

  protected abrirPdfPrefeitura(item: NotaFiscalItemResponse): void {
    const inscricao = item.inscricaoPrestador;
    const nf = item.numeroNota;
    if (!inscricao || !nf) return;
    const returnUrl = encodeURIComponent(`consultas.aspx?inscricao=${inscricao}`);
    window.open(
      `https://nfe.prefeitura.sp.gov.br/contribuinte/notaprint.aspx?inscricao=${inscricao}&nf=${nf}&returnUrl=${returnUrl}`,
      '_blank',
      'noopener,noreferrer',
    );
  }

  protected excluirNota(item: NotaFiscalItemResponse): void {
    if (this.deletingId() === item.id) return;
    if (!confirm(`Excluir a nota ${item.numeroRps ?? item.id}? Esta ação não pode ser desfeita.`)) return;
    this.deletingId.set(item.id);
    this.nfseApiService
      .excluirNotaFiscal(item.id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => this.facade.loadPage(),
        error: (error: unknown) => {
          const message = error instanceof NfseApiError
            ? error.message
            : 'Não foi possível excluir a nota fiscal.';
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
